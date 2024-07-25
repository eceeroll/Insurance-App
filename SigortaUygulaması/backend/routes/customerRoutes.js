const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/yeni-musteri", authMiddleware, customerController.addCustomer);

module.exports = router;
