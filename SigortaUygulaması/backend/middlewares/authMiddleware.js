// Kullanıcının giriş yapıp yapmama durumunu kontrol eden middleware fonksiyonu

// const authMiddleware = (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return next();
//   }
//   res.status(401).json({ message: "Unauthorized" });
// };

// module.exports = authMiddleware;

const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

module.exports = isAuthenticated;
