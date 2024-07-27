const User = require("../models/User");
const bcrypt = require("bcryptjs");
// const passport = require("../config/passport");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// Login route handler
exports.login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      console.error("Passport authentication error:", err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
    if (!user) {
      return res.status(401).send(info.message);
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ message: "Giriş hatası." });
      }
      console.log("Sending response:", {
        message: "Giriş başarılı!",
        firstName: user.firstName,
        lastName: user.lastName,
      });
      console.log("Login successful with user:", user);

      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.json({
        message: "Giriş başarılı!",
        id: user._id,
        token,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    });
  })(req, res, next);
};

// Register route handler
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, password, email, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı
    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      email,
      role,
    });

    // kullanıcıyı veritabanına kaydediyoruz.
    await newUser.save();

    res.status(200).json({ message: "Kayıt başarılı!" });
  } catch (err) {
    console.error("Kayıt sırasında bir hata oluştu:", err);
    res.status(500).json({ message: "Kayıt sırasında bir hata oluştu." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // email sistemde kayıtlı mı?
    const user = await User.findOne({ email: email });
    if (user) {
      res.status(200).json({ message: "Şifre Sıfırlama Linki Gönderildi." });
    } else {
      res
        .status(404)
        .json({ message: "Sistemde Kayıtlı Kullanıcı Bulunamadı!" });
    }
  } catch (err) {
    console.error("Şifre sıfırlama sırasında bir hata oluştu:", err);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};
