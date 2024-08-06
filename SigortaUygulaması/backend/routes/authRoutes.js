const express = require("express");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const isAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();
// LOGIN POST
router.post("/login", authController.login);

// REGISTER POST
router.post("/register", authController.register);

// FORGOT PASSWORD POST
router.post("/forgotPassword", authController.forgotPassword);

// GET USER
router.get("/users/:id", isAuthenticated, adminController.getUserById);

// UPDATE USER
router.put("/users/:id", isAuthenticated, adminController.updateUser);

router.put("/change-password", isAuthenticated, authController.changePassword);

module.exports = router;
