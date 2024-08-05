require("dotenv").config();
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const policyRoutes = require("./routes/policyRoutes");
const isAuthenticated = require("./middlewares/authMiddleware");

const PORT = 5000;

const corsOptions = {
  origin: "http://localhost:5173", // Vite'nin çalıştığı port
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors(corsOptions));

// MongoDB bağlantısı
mongoose.connect("mongodb://127.0.0.1:27017/my-auth-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/admin", adminRoutes);
app.use("/api/policy", policyRoutes);

// Korunan dashboard route'u
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send("Dashboard Page");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
