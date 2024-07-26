const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authMiddleware");

// Yeni Müşteri Ekleme
router.post("/yeni-musteri", authMiddleware, customerController.addCustomer);

// Müşteri Arama
router.get("/musteri-ara", authMiddleware, customerController.searchCustomers);

module.exports = router;
