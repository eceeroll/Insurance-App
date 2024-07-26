const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new mongoose.Schema(
  {
    tc_no: { type: String, required: true, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },
    addedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
