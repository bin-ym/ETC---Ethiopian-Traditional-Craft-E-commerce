const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcrypt");
const session = require("express-session"); // Add express-session
const MongoStore = require("connect-mongo"); // Add session store
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Adjust to your frontend URL
  credentials: true, // Allow cookies to be sent/received
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ym", // Add to .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true, // Secure cookie
      sameSite: "lax", // Adjust based on needs
    },
  })
);

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Authentication Middleware (Session-Based)
const authenticate = (req, res, next) => {
  console.log("📥 Session:", req.session);
  if (!req.session.user) {
    console.log("⚠️ No user in session");
    return res.status(401).json({ error: "Not authenticated" });
  }
  console.log("✅ Authenticated User:", req.session.user);
  req.user = req.session.user; // Pass user data to next middleware
  next();
};

// Schemas
const artisanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true },
  bio: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});
const Artisan = mongoose.model("Artisan", artisanSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: "Uncategorized" },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true },
  createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  tx_ref: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Payment = mongoose.model("Payment", paymentSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/api/session/role", (req, res) => {
  if (req.session.user) {
    console.log("✅ Session Role:", req.session.user.role);
    return res.status(200).json({ role: req.session.user.role });
  }
  console.log("⚠️ No session found");
  res.status(200).json({ role: null }); // No session
});
// Register Artisan
app.post("/api/artisans/register", async (req, res) => {
  try {
    const { name, email, password, shopName, phoneNumber, bio } = req.body;
    if (!name || !email || !password || !shopName || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingArtisan = await Artisan.findOne({ email });
    if (existingArtisan) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const artisan = new Artisan({
      name,
      email,
      password: hashedPassword,
      shopName,
      phoneNumber,
      bio,
    });

    await artisan.save();
    console.log("✅ Artisan Registered:", artisan.email);
    res.status(201).json({ message: "Artisan registered successfully", artisanId: artisan._id });
  } catch (err) {
    console.error("❌ Error registering artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login Artisan
app.post("/api/artisans/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const artisan = await Artisan.findOne({ email });
    if (!artisan || !await bcrypt.compare(password, artisan.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Store user info in session
    req.session.user = { id: artisan._id, role: "artisan" };
    console.log("✅ Artisan Logged In:", artisan.email, "Session:", req.session.user);
    res.status(200).json({ message: "Login successful", role: "artisan", id: artisan._id });
  } catch (err) {
    console.error("❌ Error logging in artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Register User
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    await user.save();
    console.log("✅ User Registered:", user.email);
    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login User
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Store user info in session
    req.session.user = { id: user._id, role: "user" };
    console.log("✅ User Logged In:", user.email, "Session:", req.session.user);
    res.status(200).json({ message: "Login successful", role: "user", id: user._id });
  } catch (err) {
    console.error("❌ Error logging in user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout Route
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error destroying session:", err.message);
      return res.status(500).json({ error: "Logout failed" });
    }
    console.log("✅ Session destroyed");
    res.clearCookie("connect.sid"); // Clear session cookie
    res.status(200).json({ message: "Logout successful" });
  });
});

// Fetch Customer Orders
app.get("/api/orders/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching orders for customer:", userId);
    const orders = await Order.find({ userId })
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });
    console.log("✅ Fetched Customer Orders Count:", orders.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching customer orders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Customer Profile
app.get("/api/users/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("✅ Fetched Customer Profile:", user.email);
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching customer profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Customer Profile
app.patch("/api/users/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("✅ Customer Profile Updated:", user.email);
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error updating customer profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All Products (Public route for customers)
app.get("/api/products/public", async (req, res) => {
  console.log("📥 Request Headers:", req.headers);
  try {
    console.log("📥 Fetching all public products");
    const products = await Product.find().sort({ createdAt: -1 });
    console.log("✅ Products Fetched:", products.length);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching public products:", err.message);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fetch Single Product by ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid product ID:", id);
      return res.status(400).json({ error: "Invalid product ID" });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    console.log("✅ Product Fetched:", product._id);
    res.status(200).json(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All Products (Artisan-specific)
app.get("/api/products", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching products for artisan:", artisanId);
    const products = await Product.find({ artisanId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add Product
app.post("/api/products", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    if (!req.file || !name || !price || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const imagePath = `/uploads/${req.file.filename}`;
    const newProduct = new Product({
      name,
      price,
      image: imagePath,
      description,
      category: category || "Uncategorized",
      artisanId,
      stock: stock || 0,
    });

    await newProduct.save();
    console.log("✅ Product Added:", newProduct);
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Product
app.put("/api/products/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, stock } = req.body;
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const updateData = { name, price, description, category, stock };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;

    const product = await Product.findOneAndUpdate(
      { _id: id, artisanId },
      updateData,
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log("✅ Product Updated:", product);
    res.status(200).json(product);
  } catch (err) {
    console.error("❌ Error updating product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Product
app.delete("/api/products/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const product = await Product.findOneAndDelete({ _id: id, artisanId });
    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log("✅ Product Deleted:", id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All User Orders (for artisans)
app.get("/api/orders/artisan", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching orders for artisan:", artisanId);
    const orders = await Order.find({ artisanId }) // Filter by artisanId
      .populate("userId", "name email")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched Orders Count:", orders.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Order Status
app.get("/api/orders/artisan", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching orders for artisan:", artisanId);
    const orders = await Order.find({ artisanId })
      .populate("userId", "name email")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched Orders Count:", orders.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Artisan Profile
app.get("/api/artisans/profile", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const artisan = await Artisan.findById(artisanId);
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    console.log("✅ Fetched Artisan Profile:", artisan.email);
    res.status(200).json(artisan);
  } catch (err) {
    console.error("❌ Error fetching artisan profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Artisan Profile
app.patch("/api/artisans/profile", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const updates = req.body;
    const artisan = await Artisan.findByIdAndUpdate(artisanId, updates, { new: true, runValidators: true });
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    console.log("✅ Artisan Profile Updated:", artisan.email);
    res.status(200).json(artisan);
  } catch (err) {
    console.error("❌ Error updating artisan profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Chapa Payment Integration
app.post("/accept-payment", async (req, res) => {
  const { amount, currency, email, first_name, last_name, phone_number, tx_ref } = req.body;

  if (!amount || !currency || !email || !first_name || !last_name || !phone_number || !tx_ref) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const header = {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const returnUrl = `${process.env.RETURN_URL || "http://localhost:3000/payment-success"}?amount=${amount}`;

    const body = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      return_url: returnUrl,
    };

    const response = await axios.post("https://api.chapa.co/v1/transaction/initialize", body, header);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: "Payment processing failed",
      error: error.response?.data || error.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});