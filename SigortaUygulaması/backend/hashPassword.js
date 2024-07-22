const bcrypt = require("bcrypt");

const password = "admin12345"; // Hashlemek istediğiniz şifre

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("Hashed password:", hash);
});
