const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const isAuthenticated = require("../middlewares/authMiddleware");

// Yeni Müşteri Ekleme
router.post("/yeni-musteri", isAuthenticated, customerController.addCustomer);

// Müşteri Arama
router.get("/musteri-ara", isAuthenticated, customerController.searchCustomers);

module.exports = router;
