// Poliçe oluşturulduğu anda kayıt edilen Araç Bilgileri

const mongoose = require("mongoose");

const carPolicySchema = new mongoose.Schema({
  policeNo: {
    type: String,
    required: true,
  },
  policy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
  },
  plakaIlKodu: { type: Number, required: true },
  plakaKodu: { type: String, required: true },
  aracMarka: { type: String, required: true },
  aracModel: { type: String, required: true },
  aracModelYili: { type: Number, required: true },
  motorNo: { type: String, required: true },
  sasiNo: { type: String, required: true },
});

const Car = mongoose.model("CarPolicy", carPolicySchema);

module.exports = Car;
