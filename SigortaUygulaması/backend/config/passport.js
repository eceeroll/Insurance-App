const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");

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

module.exports = passport;
