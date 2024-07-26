const User = require("../models/User");
const Customer = require("../models/Customer");

// Admin - Kullanıcıları Düzenle Sayfası -> Kullanıcıları Listele - Yanlarına Silme ve Düzenleme Butonları Koy. Silme ve Düzenleme işlemlerini Gerçekleştir. Admin olarak belirle Butonu da koy.

// User - Müşteri Arama Sayfası -> Teklifleri Düzenle - Düzenle - Sil Butonları Koy. Düzenle ve Sil işlemlerini gerçekleştir.

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// GET USER BY ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "Kullanıcı Bulunamadı" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// GET ALL CUSTOMERS
exports.getAllCustomers = async (req, res) => {
  try {
    // en son eklenen en üstte olacak şekilde sıralanır
    const allCustomers = await Customer.find().sort({ createdAt: -1 });
    res.json(allCustomers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({ message: "Kullanıcı başarıyla silindi!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    await User.findByIdAndUpdate(userId, updateData);
    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Kullanıcı başarıyla güncellendi.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Sunucu Hatası" });
  }
};
