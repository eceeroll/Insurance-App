const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

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

      console.log("Login successful with user:", user);

      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "12h",
        }
      );

      return res.json({
        message: "Giriş başarılı!",
        id: user._id,
        token,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
      });
    });
  })(req, res, next);
};

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

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  console.log(req.body);

  const userId = req.user.id;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Şifreler Eşleşmiyor" });
  }

  try {
    const user = await User.findById(userId);

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Yeni şifre en az 8 karakter olmalıdır." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Şifre Yanlış" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Şifre Güncellendi" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Şifre yenileme işlemi başarısız" });
  }
};
