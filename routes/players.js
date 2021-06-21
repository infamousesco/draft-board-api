"use strict";
const Player = require("../models").Player;
const express = require("express");
const router = express.Router();
const { sequelize } = require("../models");

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

router.get(
  "/api/players",
  asyncHandler(async (req, res) => {
    console.log(req);
    const players = await Player.findAll({});
    res.status(200).json(players);
  })
);

router.post(
  "/api/players",
  asyncHandler(async (req, res) => {
    try {
      const player = await Player.create(req.body);
      res.location("/").status(201).end();
      console.log("Player added");
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

module.exports = router;
