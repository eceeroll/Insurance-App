const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/authMiddleware");
const policyController = require("../controllers/policyController");

// Poliçe Oluşturma
router.post("/yeni-police", isAuthenticated, policyController.createPolicy);

// Araba Listesi Çek
router.get("/arabalar", isAuthenticated, policyController.getAllCars);

// Poliçe Durumunu Güncelle
router.put(
  "/update-status/:id",
  isAuthenticated,
  policyController.updatePolicyStatus
);

router.put("/update/:id", isAuthenticated, policyController.updatePolicy);

// ID ile Poliçe Bul
router.get("/policeler/:id", isAuthenticated, policyController.findPolicyBydId);

// Kullanıcıya Ait Poliçeleri Listele
router.get("/policeler", isAuthenticated, policyController.getAllPolicies);

module.exports = router;
