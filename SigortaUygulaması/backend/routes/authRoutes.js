const express = require("express");
const authController = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();



// LOGIN POST
router.post("/login", authController.login);

// REGISTER POST
router.post("/register", authController.register);

// FORGOT PASSWORD POST
router.post("/forgotPassword", authController.forgotPassword);

module.exports = router;
