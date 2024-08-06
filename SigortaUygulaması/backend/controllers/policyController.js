const mongoose = require("mongoose");
const Car = require("../models/Car");
const Policy = require("../models/Policy");
const CarPolicy = require("../models/CarPolicy");
const Customer = require("../models/Customer");

// GET ALL CARS
exports.getAllCars = async (req, res) => {
  try {
    const allCars = await Car.find();
    res.json(allCars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// CREATE POLICY
exports.createPolicy = async (req, res) => {
  try {
    const {
      carId,
      plakaIlKodu,
      plakaKodu,
      motorNo,
      sasiNo,
      prim,
      bransKodu,
      musteriNo,
      userId,
      username,
      binaBilgileri,
    } = req.body;

    let selectedCar;
    let newCarPolicy;

    if (bransKodu === "310" || bransKodu === "340") {
      selectedCar = await Car.findById(carId);
      if (!selectedCar) {
        return res.status(404).json({ message: "Car NOT FOUND" });
      }
    }

    // Fetch customer information
    const customer = await Customer.findById(musteriNo);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Unique poliçe no oluşturma
    let policeNo;
    let isUnique = false;
    while (!isUnique) {
      policeNo = Math.floor(10000000 + Math.random() * 90000000).toString();
      const existingPolicy = await Policy.findOne({ policeNo });
      if (!existingPolicy) {
        isUnique = true;
      }
    }

    const baslangicTarihi = new Date();
    const bitisTarihi = new Date(baslangicTarihi);
    bitisTarihi.setDate(baslangicTarihi.getDate() + 15);

    const newPolicy = new Policy({
      policeNo,
      musteriBilgileri: {
        musteriNo,
        musteriAd: customer.first_name,
        musteriSoyad: customer.last_name,
      },
      status: "T",
      bransKodu,
      prim,
      onaylayan: {
        id: userId,
        username,
      },
      tanzimTarihi: new Date(),
      baslangicTarihi,
      bitisTarihi,
      binaBilgileri: bransKodu === "199" ? binaBilgileri : null,
    });

    await newPolicy.save();

    if (bransKodu === "310" || bransKodu === "340") {
      newCarPolicy = new CarPolicy({
        policeNo: newPolicy.policeNo,
        policy: newPolicy,
        plakaIlKodu,
        plakaKodu,
        aracMarka: selectedCar.brand,
        aracModel: selectedCar.model,
        aracModelYili: selectedCar.modelYear,
        motorNo,
        sasiNo,
      });

      await newCarPolicy.save();

      return res.status(201).json({
        message: "Kasko Trafik poliçe oluşturuldu",
        newPolicy,
        newCarPolicy,
      });
    } else {
      return res.status(201).json({ message: "Poliçe Oluşturuldu", newPolicy });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// FIND POLICY BY ID
exports.findPolicyBydId = async (req, res) => {
  try {
    const id = req.params.id;
    const policy = await Policy.findById(id);
    if (!policy) {
      res.status(404).json({ message: "Poliçe Bulunamadı" });
    }
    let carDetails = null;
    if (policy.bransKodu === "310" || policy.bransKodu === "340") {
      carDetails = await CarPolicy.findOne({ policeNo: policy.policeNo });
    }
    res.json({ policy, carDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// UPDATE POLICY STATUS TO "K
exports.updatePolicyStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const policy = await Policy.findById(id);

    if (!policy) {
      res.status(404).json({ message: "Poliçe Bulunamadı" });
    }

    policy.status = "K";

    await policy.save();

    res.status(200).json({ message: "Poliçe durumu güncellendi", policy });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error });
  }
};

// USER / GET POLICIES
exports.getAllPolicies = async (req, res) => {
  try {
    const userID = req.user.id;

    const query = {
      "onaylayan.id": userID,
    };

    const policies = await Policy.find(query);
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// DELETE POLICY
exports.deletePolicy = async (req, res) => {
  try {
    const policyId = req.params.id;

    const policy = await Policy.findByIdAndDelete(policyId);

    if (!policy) {
      res.status(404).json({ message: "Poliçe Bulunmaadı" });
    }

    res.status(200).json({ message: "Poliçe Silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// GET CAR DETAILS BY POLICY NO
exports.getCarPolicyByPoliceNo = async (req, res) => {
  try {
    const { policeNo } = req.params;

    // Find the Policy document based on the string policeNo
    const policy = await Policy.findOne({ policeNo });
    if (!policy) {
      return res.status(404).json({ message: "Poliçe bulunamadı" });
    }

    // Use the ObjectId from the found Policy document
    const carPolicy = await CarPolicy.findOne({ policeNo: policy._id });

    if (!carPolicy) {
      return res.status(404).json({ message: "Araç bilgileri bulunamadı" });
    }

    res.json(carPolicy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};
