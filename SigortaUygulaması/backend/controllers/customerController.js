const Customer = require("../models/Customer");

// USER / ADD CUSTOMER
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

    console.log("req.user-", req.user);

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
      addedBy:
        {
          id: req.user.id,
          username: req.user.username,
        } || null,
    });

    await newCustomer.save();

    res
      .status(201)
      .json({ message: "Customer added successfully!", customer: newCustomer });
  } catch (error) {
    if (error.code && error.code === 11000) {
      // Benzersizlik hatası
      return res
        .status(400)
        .json({ message: "Bu TC Kimlik Numarası zaten kayıtlı." });
    }

    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// USER / SEARCH CUSTOMERS
exports.searchCustomers = async (req, res) => {
  const { first_name, last_name, tc_no } = req.query;

  // mongodb sorgusu için nesne oluşturulur
  const query = {
    "addedBy.id": req.user.id, // addedBy içindeki id'yi sorguluyoruz
  };

  if (tc_no) {
    query.tc_no = new RegExp(tc_no, "i");
  }
  if (first_name) {
    query.first_name = new RegExp(first_name, "i");
  }
  if (last_name) {
    query.last_name = new RegExp(last_name, "i");
  }

  if (!tc_no && !first_name && !last_name) {
    const allCustomers = await Customer.find(query);
    return res.json(allCustomers);
  }

  const customers = await Customer.find(query);
  res.json(customers);
};

// USER / UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const updateData = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedCustomer) {
      return res.status(404).json({ message: "Müşteri Bulunamadı" });
    }

    res.json({
      message: "Müşteri Bilgileri Güncellendi",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error("Güncelleme hatası:", error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};

// USER / DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findByIdAndDelete(customerId);

    if (!customer) {
      res.status(404).json({ message: "Müşteri Bulunamadı" });
    }

    res.json({ message: "Müşteri Başarıyla Silindi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};
