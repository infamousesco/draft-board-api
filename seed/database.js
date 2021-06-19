"use strict";

const bcryptjs = require("bcryptjs");
const Context = require("./context");

class Database {
  constructor(seedData, enableLogging) {
    this.courses = seedData.courses;
    this.players = seedData.players;
    this.enableLogging = enableLogging;
    this.context = new Context("fsjstd-restapi.db", enableLogging);
  }

  log(message) {
    if (this.enableLogging) {
      console.info(message);
    }
  }

  tableExists(tableName) {
    this.log(`Checking if the ${tableName} table exists...`);

    return this.context.retrieveValue(
      `
        SELECT EXISTS (
          SELECT 1 
          FROM sqlite_master 
          WHERE type = 'table' AND name = ?
        );
      `,
      tableName
    );
  }

  createPlayer(player) {
    return this.context.execute(
      `
        INSERT INTO players
          (firstName, lastName, position, teamName, byeWeek)
        VALUES
          // (?, ?, ?, ?, );
      `,
      player.firstName,
      player.lastName,
      player.position,
      player.teamName,
      player.byeWeek
    );
  }

  createCourse(course) {
    return this.context.execute(
      `
        INSERT INTO Courses
          (userId, title, description, estimatedTime, materialsNeeded, createdAt, updatedAt)
        VALUES
          (?, ?, ?, ?, ?, datetime('now'), datetime('now'));
      `,
      course.userId,
      course.title,
      course.description,
      course.estimatedTime,
      course.materialsNeeded
    );
  }

  async hashUserPasswords(Players) {
    const PlayersWithHashedPasswords = [];

    for (const player of players) {
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      PlayersWithHashedPasswords.push({ ...user, password: hashedPassword });
    }

    return PlayersWithHashedPasswords;
  }

  async createPlayers(players) {
    for (const player of players) {
      await this.createPlayer(player);
    }
  }

  async createCourses(courses) {
    for (const course of courses) {
      await this.createCourse(course);
    }
  }

  async init() {
    const userTableExists = await this.tableExists("Players");

    if (userTableExists) {
      this.log("Dropping the Players table...");

      await this.context.execute(`
        DROP TABLE IF EXISTS Players;
      `);
    }

    this.log("Creating the Players table...");

    await this.context.execute(`
      CREATE TABLE Players (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        firstName VARCHAR(255) NOT NULL DEFAULT '', 
        lastName VARCHAR(255) NOT NULL DEFAULT '', 
        position VARCHAR(255) NOT NULL DEFAULT ''  
        teamName VARCHAR(255) NOT NULL DEFAULT '', 
        byeWeek INTEGER NOT NULL
        
      );
    `);

    this.log("Hashing the user passwords...");

    const Players = await this.hashUserPasswords(this.Players);

    this.log("Creating the user records...");

    await this.createPlayers(Players);

    const courseTableExists = await this.tableExists("Courses");

    if (courseTableExists) {
      this.log("Dropping the Courses table...");

      await this.context.execute(`
        DROP TABLE IF EXISTS Courses;
      `);
    }

    this.log("Creating the Courses table...");

    await this.context.execute(`
      CREATE TABLE Courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title VARCHAR(255) NOT NULL DEFAULT '', 
        description TEXT NOT NULL DEFAULT '', 
        estimatedTime VARCHAR(255), 
        materialsNeeded VARCHAR(255), 
        createdAt DATETIME NOT NULL, 
        updatedAt DATETIME NOT NULL, 
        userId INTEGER NOT NULL DEFAULT -1 
          REFERENCES Players (id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    this.log("Creating the course records...");

    await this.createCourses(this.courses);

    this.log("Database successfully initialized!");
  }
}

module.exports = Database;
