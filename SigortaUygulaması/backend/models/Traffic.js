const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema({
  plakaIlKodu: { type: Number, required: true },
  plakaKodu: { type: String, required: true },
  Car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
  motorNo: { type: String, required: true },
  sasiNo: { type: String, required: true },
  bransKodu: "310",
});

const Traffic = mongoose.model("Traffic", trafficSchema);

module.exports = Traffic;
