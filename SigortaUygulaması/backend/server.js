const cors = require("cors");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const PORT = 5000;

const corsOptions = {
  origin: "http://localhost:5173", // Vite'nin çalıştığı port
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

// express bağlantısı
const app = express();

// Middleware'leri ekleyin
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// CORS middleware'ini ekleyin
app.use(cors(corsOptions));

// MongoDB bağlantısı
mongoose.connect("mongodb://127.0.0.1:27017/my-auth-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Kullanıcı modeli
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  username: String,
  password: String,
  email: String,
  role: String,
});
const User = mongoose.model("User", UserSchema);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Login attempt with username:", username);
      const user = await User.findOne({ username });
      if (!user) {
        console.log("User not found");
        return done(null, false, { message: "Kayıtlı kullanıcı bulunamadı." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password incorrect");
        return done(null, false, {
          message: "Kullanıcı adı veya parola yanlış.",
        });
      }
      console.log("Login successful");
      return done(null, user);
    } catch (err) {
      console.error("Error during authentication:", err);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Error during deserialization:", err);
    done(err);
  }
});

// Login route'u
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Passport authentication error:", err);
      return next(err);
    }
    if (!user) {
      console.log("Login failed:", info.message);
      return res.status(401).send(info.message);
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during login:", err);
        return next(err);
      }
      console.log("Sending response:", {
        message: "Giriş başarılı!",
        firstName: user.firstName,
        lastName: user.lastName,
      });
      console.log("Login successful with user:", user);

      return res.json({
        message: "Giriş başarılı!",
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
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
});

app.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Gelen e-posta adresi:", email);

    // email sistemde kayıtlı mı?
    const user = await User.findOne({ email: email });
    console.log("Bulunan kullanıcı:", user);
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
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
