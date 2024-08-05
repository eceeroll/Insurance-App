const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const isAuthenticated = require("../middlewares/authMiddleware");
const policyController = require("../controllers/policyController");

// Yeni Müşteri Ekleme
router.post("/yeni-musteri", isAuthenticated, customerController.addCustomer);

// Müşteri Arama ( Listeleme )
router.get("/musteri-ara", isAuthenticated, customerController.searchCustomers);

// ID ile Müşteri Bulma
router.get(
  "/musteri-ara/:id",
  isAuthenticated,
  customerController.getCustomerById
);

// Müşteri Bilgisi Güncelleme
router.put(
  "/musteri-ara/:id",
  isAuthenticated,
  customerController.updateCustomer
);

// Müşteri Silme
router.delete(
  "/musteri-ara/:id",
  isAuthenticated,
  customerController.deleteCustomer
);

// Müşteriye Ait Poliçeleri Listele
router.get(
  "/policeler/:musteriNo",
  isAuthenticated,
  customerController.getPolicies
);

// Poliçe Sil
router.delete("/policeler/:id", isAuthenticated, policyController.deletePolicy);

module.exports = router;
