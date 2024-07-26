const express = require("express");
const authController = require("../controllers/authController");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// GET ALL USERS
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// GET USER BY ID
router.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Kullanıcı Bulunamadı" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// LOGIN POST
router.post("/login", authController.login);

// REGISTER POST
router.post("/register", authController.register);

// FORGOT PASSWORD POST
router.post("/forgotPassword", authController.forgotPassword);

module.exports = router;
