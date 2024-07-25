const Customer = require("../models/Customer");

exports.addCustomer = async (req, res) => {
  try {
    const {
      tc_no,
      birth_date,
      first_name,
      last_name,
      province,
      district,
      phone_number,
      email,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const newCustomer = new Customer({
      first_name,
      last_name,
      tc_no,
      date_of_birth: birth_date,
      province,
      district,
      phone_number,
      email,
      addedBy: req.user.id || null,
    });

    await newCustomer.save();

    res
      .status(201)
      .json({ message: "Customer added successfully!", customer: newCustomer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
