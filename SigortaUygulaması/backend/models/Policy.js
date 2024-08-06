const mongoose = require("mongoose");

const binaBilgileriSchema = new mongoose.Schema({
  uavtAdresKodu: { type: String, maxlength: 10 },
  binaMetreKare: { type: Number, min: 0 },
  binaKat: { type: Number, min: 0 },
  yapiTarzi: {
    type: String,
  },
  insaYili: { type: Number, minlength: 4, maxlength: 4 },
  hasarDurumu: {
    type: String,
  },
});

const policySchema = new mongoose.Schema({
  policeNo: { type: String, unique: true, required: true, length: 8 },
  musteriBilgileri: {
    musteriNo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    musteriAd: { type: String, required: true },
    musteriSoyad: { type: String, required: true },
  },

  status: { type: String, enum: ["T", "K"], default: "T" },
  bransKodu: {
    type: String,
    enum: ["310", "340", "199", "610"],
    required: true,
  },
  prim: { type: Number, required: true },
  onaylayan: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
  },
  tanzimTarihi: { type: Date, default: Date.now },
  baslangicTarihi: { type: Date, required: true },
  bitisTarihi: { type: Date, required: true },
  // dask için
  binaBilgileri: { type: binaBilgileriSchema, default: null },
});

policySchema.pre("save", function (next) {
  if (this.bransKodu === "199") {
    if (!this.binaBilgileri) {
      return next(new Error("BinaBilgileri is required for DASK policies."));
    }
  }
  next();
});

const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
