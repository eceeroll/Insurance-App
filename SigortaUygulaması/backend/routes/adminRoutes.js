const express = require("express");
const router = express.Router();
const User = require("../models/User");
const adminController = require("../controllers/adminController");
const isAuthenticated = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

// GET ALL USERS
router.get("/users", isAuthenticated, isAdmin, adminController.getAllUsers);

// GET ALL CUSTOMERS
router.get(
  "/customers",
  isAuthenticated,
  isAdmin,
  adminController.getAllCustomers
);

// GET USER BY ID
router.get("/users/:id", isAuthenticated, isAdmin, adminController.getUserById);

// DELETE USER
router.delete(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  adminController.deleteUser
);

// UPDATE USER
router.put("/users/:id", isAuthenticated, isAdmin, adminController.updateUser);

module.exports = router;
