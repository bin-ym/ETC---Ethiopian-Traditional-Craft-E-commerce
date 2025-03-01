const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ym",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
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
  req.user = req.session.user;
  next();
};

// Schemas
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, trim: true }, // Add phoneNumber field
  createdAt: { type: Date, default: Date.now },
}, { collection: "admin" });
const Admin = mongoose.model("Admin", adminSchema);

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
  paymentStatus: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" }, // Add paymentStatus
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

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", commentSchema);
// Routes
app.get("/api/session/role", (req, res) => {
  if (req.session.user) {
    console.log("✅ Session Role:", req.session.user.role);
    return res.status(200).json({ role: req.session.user.role });
  }
  console.log("⚠️ No session found");
  res.status(200).json({ role: null });
});

// Unified Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    // Check Users collection
    let user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { id: user._id, role: "user" };
      console.log("✅ User Logged In:", user.email, "Session:", req.session.user);
      return res.status(200).json({ message: "Login successful", role: "user", id: user._id });
    }

    // Check Artisans collection
    let artisan = await Artisan.findOne({ email });
    if (artisan && await bcrypt.compare(password, artisan.password)) {
      req.session.user = { id: artisan._id, role: "artisan" };
      console.log("✅ Artisan Logged In:", artisan.email, "Session:", req.session.user);
      return res.status(200).json({ message: "Login successful", role: "artisan", id: artisan._id });
    }

    // Check Admins collection
    let admin = await Admin.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.password)) {
      req.session.user = { id: admin._id, role: "admin" };
      console.log("✅ Admin Logged In:", admin.email, "Session:", req.session.user);
      return res.status(200).json({ message: "Login successful", role: "admin", id: admin._id });
    }

    return res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    console.error("❌ Error logging in:", err.message);
    res.status(500).json({ error: "Server error" });
  }
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

// Logout Route
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error destroying session:", err.message);
      return res.status(500).json({ error: "Logout failed" });
    }
    console.log("✅ Session destroyed");
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logout successful" });
  });
});

// Create Order (Customer)
app.post("/api/orders", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const { products, totalAmount, artisanId } = req.body;
    if (!products || products.length === 0 || !totalAmount || !artisanId) {
      return res.status(400).json({ error: "Products, total amount, and artisan ID are required" });
    }

    // Validate products
    for (const item of products) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ error: "Each product must have productId, name, price, and quantity" });
      }
    }

    // Validate artisanId
    if (!mongoose.Types.ObjectId.isValid(artisanId)) {
      return res.status(400).json({ error: "Invalid artisan ID" });
    }

    const order = new Order({
      userId,
      products,
      totalAmount,
      artisanId,
      status: "Pending",
      paymentStatus: "Pending",
    });

    await order.save();
    console.log("✅ Order Created:", order._id);
    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
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

// Fetch All Products (Admin) - Must come before /api/products/:id
app.get("/api/products/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const products = await Product.find()
      .populate("artisanId", "name email")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched All Products Count:", products.length);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Single Product by ID - Must come after /api/products/admin
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

// Delete Product (Admin)
app.delete("/api/products/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid product ID:", id);
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log("✅ Product Deleted:", id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
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

// Update Order Status
app.put("/api/orders/artisan/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const order = await Order.findOneAndUpdate(
      { _id: id, artisanId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    console.log("✅ Order Updated:", id, "New Status:", status);
    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
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
// Fetch Admin Profile
app.get("/api/admin/profile", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    console.log("✅ Fetched Admin Profile:", admin.email);
    res.status(200).json(admin);
  } catch (err) {
    console.error("❌ Error fetching admin profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Admin Profile
app.patch("/api/admin/profile", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const updates = req.body;
    const admin = await Admin.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    console.log("✅ Admin Profile Updated:", admin.email);
    res.status(200).json(admin);
  } catch (err) {
    console.error("❌ Error updating admin profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Update Admin Settings (Password)
app.patch("/api/admin/settings", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    console.log("✅ Admin Password Updated:", admin.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating admin settings:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Fetch Admin Dashboard Statistics
app.get("/api/admin/statistics", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalArtisans = await Artisan.countDocuments();

    const stats = {
      totalProducts,
      totalOrders,
      totalUsers: totalUsers + totalArtisans, // Combine users and artisans
    };

    console.log("✅ Fetched Admin Statistics:", stats);
    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Error fetching admin statistics:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Create New User (Admin)
app.post("/api/users/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

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
    console.log("✅ User Created by Admin:", user.email);
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create New Artisan (Admin)
app.post("/api/artisans/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { name, email, password, shopName, phoneNumber } = req.body;
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
    });

    await artisan.save();
    console.log("✅ Artisan Created by Admin:", artisan.email);
    res.status(201).json(artisan);
  } catch (err) {
    console.error("❌ Error creating artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Create Payment and Initiate Chapa Payment
app.post("/accept-payment", async (req, res) => {
  const { amount, currency, email, first_name, last_name, phone_number, tx_ref, orderId } = req.body;

  if (!amount || !currency || !email || !first_name || !last_name || !phone_number || !tx_ref || !orderId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create a payment record
    const payment = new Payment({
      orderId,
      tx_ref,
      amount,
      status: "Pending",
      email,
    });
    await payment.save();

    const header = {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const returnUrl = `${process.env.RETURN_URL || "http://localhost:3000/payment-success"}?amount=${amount}&orderId=${orderId}`;

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

    // Mock payment success for testing (in production, use Chapa webhook)
    payment.status = "Success";
    await payment.save();

    // Update the order's paymentStatus
    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = "Success";
      await order.save();
      console.log("✅ Order Payment Status Updated:", orderId);
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({
      message: "Payment processing failed",
      error: error.response?.data || error.message,
    });
  }
});
// Fetch All Orders (Admin)
app.get("/api/orders/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("artisanId", "name email")
      .populate("products.productId", "name price")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched All Orders Count:", orders.length);
    res.status(200).json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Order Status (Admin)
app.put("/api/orders/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    console.log("✅ Order Updated:", id, "New Status:", status);
    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All Products (Admin)
app.get("/api/products/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const products = await Product.find()
      .populate("artisanId", "name email")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched All Products Count:", products.length);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Product (Admin)
app.delete("/api/products/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid product ID:", id);
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    console.log("✅ Product Deleted:", id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All Users (Admin)
app.get("/api/users/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const users = await User.find().sort({ createdAt: -1 });
    console.log("✅ Fetched All Users Count:", users.length);
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete User (Admin)
app.delete("/api/users/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid user ID:", id);
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("✅ User Deleted:", id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch All Artisans (Admin)
app.get("/api/artisans/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const artisans = await Artisan.find().sort({ createdAt: -1 });
    console.log("✅ Fetched All Artisans Count:", artisans.length);
    res.status(200).json(artisans);
  } catch (err) {
    console.error("❌ Error fetching artisans:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Artisan (Admin)
app.delete("/api/artisans/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid artisan ID:", id);
      return res.status(400).json({ error: "Invalid artisan ID" });
    }

    const artisan = await Artisan.findByIdAndDelete(id);
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    console.log("✅ Artisan Deleted:", id);
    res.status(200).json({ message: "Artisan deleted" });
  } catch (err) {
    console.error("❌ Error deleting artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Update User (Admin)
app.put("/api/users/admin/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    const { name, email, phoneNumber, password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ error: "Name, email, and phone number are required" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for duplicate email (excluding the current user)
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    user.name = name;
    user.email = email;
    user.phoneNumber = phoneNumber;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    console.log("✅ User Updated by Admin:", user.email);
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error updating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Artisan (Admin)
app.put("/api/artisans/admin/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    const { name, email, shopName, phoneNumber, password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid artisan ID" });
    }

    if (!name || !email || !shopName || !phoneNumber) {
      return res.status(400).json({ error: "Name, email, shop name, and phone number are required" });
    }

    const artisan = await Artisan.findById(id);
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    // Check for duplicate email (excluding the current artisan)
    const existingArtisan = await Artisan.findOne({ email, _id: { $ne: id } });
    if (existingArtisan) return res.status(400).json({ error: "Email already in use" });

    artisan.name = name;
    artisan.email = email;
    artisan.shopName = shopName;
    artisan.phoneNumber = phoneNumber;
    if (password) {
      artisan.password = await bcrypt.hash(password, 10);
    }

    await artisan.save();
    console.log("✅ Artisan Updated by Admin:", artisan.email);
    res.status(200).json(artisan);
  } catch (err) {
    console.error("❌ Error updating artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Fetch All Comments (Admin)
app.get("/api/comments/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const comments = await Comment.find()
      .populate("userId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched All Comments Count:", comments.length);
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Comment (Admin)
app.delete("/api/comments/admin/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    console.log("✅ Comment Deleted:", id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Fetch Customer Comments
app.get("/api/comments/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching comments for customer:", userId);
    const comments = await Comment.find({ userId })
      .populate("userId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched Customer Comments Count:", comments.length);
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching customer comments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Customer Comment
app.delete("/api/comments/customer/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await Comment.findOneAndDelete({ _id: id, userId });
    if (!comment) return res.status(404).json({ error: "Comment not found or not authorized" });

    console.log("✅ Comment Deleted by Customer:", id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting customer comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Artisan Comments (Comments on their products)
app.get("/api/comments/artisan", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching comments for artisan:", artisanId);
    // First, find products belonging to the artisan
    const products = await Product.find({ artisanId });
    const productIds = products.map(product => product._id);

    // Then, find comments on those products
    const comments = await Comment.find({ productId: { $in: productIds } })
      .populate("userId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched Artisan Comments Count:", comments.length);
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching artisan comments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete Artisan Comment (Delete comments on their products)
app.delete("/api/comments/artisan/:id", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    // Find the comment
    const comment = await Comment.findById(id).populate("productId");
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Check if the comment is on a product belonging to the artisan
    if (comment.productId.artisanId.toString() !== artisanId) {
      return res.status(403).json({ error: "Not authorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(id);
    console.log("✅ Comment Deleted by Artisan:", id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting artisan comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Update Customer Comment
app.put("/api/comments/customer/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    const { text } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const comment = await Comment.findOne({ _id: id, userId });
    if (!comment) return res.status(404).json({ error: "Comment not found or not authorized" });

    comment.text = text;
    await comment.save();

    console.log("✅ Comment Updated by Customer:", id);
    res.status(200).json(comment);
  } catch (err) {
    console.error("❌ Error updating customer comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Artisan Comment (Update comments on their products)
app.put("/api/comments/artisan/:id", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    const { text } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    // Find the comment
    const comment = await Comment.findById(id).populate("productId");
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Check if the comment is on a product belonging to the artisan
    if (comment.productId.artisanId.toString() !== artisanId) {
      return res.status(403).json({ error: "Not authorized to update this comment" });
    }

    comment.text = text;
    await comment.save();

    console.log("✅ Comment Updated by Artisan:", id);
    res.status(200).json(comment);
  } catch (err) {
    console.error("❌ Error updating artisan comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});
// Fetch Products for Customer to Comment On (e.g., from their orders)
app.get("/api/products/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching products for customer to comment on:", userId);

    // Fetch orders for the customer
    const orders = await Order.find({ userId });

    console.log("Fetched orders:", orders);

    // Extract unique product IDs from orders, filter out invalid IDs
    const productIds = [...new Set(
      orders
        .filter(order => Array.isArray(order.products) && order.products.length > 0) // Ensure products array exists
        .flatMap(order =>
          order.products
            .map(product => {
              try {
                // Check if product.productId exists and is a valid ObjectId
                if (product && product.productId) {
                  // Handle both string and ObjectId types
                  const productId = typeof product.productId === "object" && product.productId._id
                    ? product.productId._id.toString()
                    : product.productId.toString();

                  if (mongoose.Types.ObjectId.isValid(productId)) {
                    return productId;
                  }
                }
                console.warn("Invalid or missing productId in order:", order._id, "product:", product);
                return null;
              } catch (err) {
                console.error("Error validating productId in order:", order._id, "product:", product, "error:", err.message);
                return null;
              }
            })
            .filter(id => id !== null) // Remove null entries
        )
    )];

    console.log("Extracted product IDs:", productIds);

    if (productIds.length === 0) {
      console.log("No valid product IDs found for customer:", userId);
      return res.status(200).json([]); // No valid products found, return empty array
    }

    // Fetch product details for those IDs
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name _id")
      .sort({ name: 1 });

    console.log("✅ Fetched Products for Commenting:", products);
    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products for customer:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});