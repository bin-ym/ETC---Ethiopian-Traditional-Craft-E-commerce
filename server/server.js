const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const multer = require("multer");
const path = require("path"); // Single declaration at the top
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const fs = require("fs");
const { exec } = require("child_process");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

// Create HTTP server for WebSocket integration
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Middleware with Enhanced Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ym",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
      autoRemove: "native",
    }, (err) => {
      if (err) {
        console.error("❌ MongoStore Initialization Error:", err);
      }
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax",
      secure: false, // Set to true in production with HTTPS
    },
  })
);

app.use((req, res, next) => {
  if (!req.session) {
    console.error("❌ Session middleware failed to initialize session");
    return res.status(500).json({ error: "Session middleware error" });
  }
  next();
});

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Schemas
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "admin" }
);
const Admin = mongoose.model("Admin", adminSchema);

const artisanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true },
  bio: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});
const Artisan = mongoose.model("Artisan", artisanSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: [
      "Woven Textiles",
      "Pottery",
      "Jewellery",
      "Baskets",
      "Wood Carvings",
      "Other Ethiopian Traditional Crafts",
      "Uncategorized",
    ],
    default: "Uncategorized",
  },
  artisanId: { type: mongoose.Schema.Types.ObjectId, ref: "Artisan", required: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerEmail: { type: String, trim: true },
  customerName: { type: String, trim: true },
  customerPhoneNumber: { type: String, trim: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["Pending", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Pending", "Success", "Failed"], default: "Pending" },
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
  isActive: { type: Boolean, default: true },
});
const User = mongoose.model("User", userSchema);

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  createdAt: { type: Date, default: Date.now },
});
const Comment = mongoose.model("Comment", commentSchema);

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, required: true, enum: ["user", "artisan", "admin"] },
  createdAt: { type: Date, default: Date.now, expires: 24 * 60 * 60 },
});
const Session = mongoose.model("Session", sessionSchema);

// Validation Functions
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{}|;:,.<>?]{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must be at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*()_+-=[]{}|;:,.<>?).";
  }
  return null;
};

const validatePhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return "Phone number must be exactly 10 digits and contain only numbers.";
  }
  return null;
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    if (!req.sessionID) {
      console.log("⚠️ No sessionID in request - Session middleware issue");
      return res.status(401).json({ error: "Not authenticated: No sessionID found" });
    }

    console.log("📥 Authenticating request, sessionID:", req.sessionID);
    console.log("📥 Cookies:", req.headers.cookie);

    let session = await Session.findOne({ sessionId: req.sessionID });
    if (!session) {
      console.log("⚠️ No session found for sessionID:", req.sessionID);
      return res.status(401).json({ error: "Not authenticated: Session not found" });
    }

    console.log("✅ Session found:", session);
    req.user = { id: session.userId, role: session.role };
    next();
  } catch (err) {
    console.error("❌ Authentication error:", err.message);
    res.status(401).json({ error: "Authentication failed: " + err.message });
  }
};

// WebSocket Setup with Authentication and Broadcast
const broadcast = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

wss.on("connection", async (ws, req) => {
  const sessionId = req.headers.cookie?.match(/connect\.sid=s%3A([^;]+)/)?.[1];
  if (!sessionId || !(await Session.findOne({ sessionId }))) {
    ws.close(1008, "Authentication required");
    console.log("❌ WebSocket connection rejected: No valid session");
    return;
  }

  console.log("✅ WebSocket client connected with sessionID:", sessionId);
  ws.on("message", (message) => {
    console.log("Received:", message);
    ws.send("Echo: " + message); // Echo for testing
  });
  ws.on("close", () => console.log("❌ WebSocket client disconnected"));
  ws.on("error", (err) => console.error("❌ WebSocket error:", err));
});

// Routes
app.post("/api/admin/backup", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      console.log("❌ Access denied: Not an admin, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    const backupDir = path.join(__dirname, "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFile);

    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name";
    exec(`mongodump --uri="${mongoUri}" --archive=${backupPath}`, (err) => {
      if (err) {
        console.error("❌ Backup failed:", err);
        return res.status(500).json({ error: "Failed to create backup" });
      }
      console.log("✅ Backup created:", backupPath);
      res.status(200).json({ backupFile: backupFile });
    });
  } catch (err) {
    console.error("❌ Error in backup endpoint:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Toggle Maintenance Mode
let maintenanceMode = false;
app.post("/api/admin/maintenance", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      console.log("❌ Access denied: Not an admin, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    maintenanceMode = !maintenanceMode;
    console.log("✅ Maintenance mode toggled:", maintenanceMode);
    res.status(200).json({ maintenance: maintenanceMode });
  } catch (err) {
    console.error("❌ Error toggling maintenance:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Maintenance Middleware
app.use((req, res, next) => {
  if (maintenanceMode && req.user?.role !== "admin") {
    return res.status(503).json({ error: "Site is under maintenance. Please try again later." });
  }
  next();
});

// Session Routes
app.get("/api/session/role", async (req, res) => {
  try {
    console.log("📥 Fetching session role, sessionID:", req.sessionID);
    const session = await Session.findOne({ sessionId: req.sessionID });
    if (session) {
      console.log("✅ Session Role:", session.role);
      return res.status(200).json({ role: session.role });
    }
    console.log("⚠️ No session found for sessionID:", req.sessionID);
    res.status(200).json({ role: null });
  } catch (err) {
    console.error("❌ Error fetching session role:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/session/user", authenticate, async (req, res) => {
  try {
    const { role, id } = req.user;
    console.log("📥 Fetching user data for role:", role, "ID:", id);

    let user;
    switch (role) {
      case "user":
        user = await User.findById(id).select("name email phoneNumber");
        break;
      case "artisan":
        user = await Artisan.findById(id).select("name email phoneNumber");
        break;
      case "admin":
        user = await Admin.findById(id).select("name email phoneNumber");
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    if (!user) {
      console.log("⚠️ User not found for ID:", id);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User data fetched:", user);
    res.status(200).json({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    console.error("❌ Error fetching user data:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Authentication Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    console.log("📥 Login request for email:", email, "Session ID:", req.sessionID);

    let user = await User.findOne({ email });
    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(403).json({
          error: "Your account is inactive. Please contact the admin at binyam.tage@gmail.com to activate your account.",
        });
      }
      await Session.deleteMany({ userId: user._id });
      const session = new Session({
        sessionId: req.sessionID,
        userId: user._id,
        role: "user",
      });
      await session.save();
      req.session.user = { id: user._id, role: "user" };
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ User Logged In:", user.email);
      return res.status(200).json({ message: "Login successful", role: "user", id: user._id });
    }

    let artisan = await Artisan.findOne({ email });
    if (artisan) {
      if (!(await bcrypt.compare(password, artisan.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!artisan.isActive) {
        return res.status(403).json({
          error: "Your account is inactive. Please contact the admin at admin@example.com to activate your account.",
        });
      }
      await Session.deleteMany({ userId: artisan._id });
      const session = new Session({
        sessionId: req.sessionID,
        userId: artisan._id,
        role: "artisan",
      });
      await session.save();
      req.session.user = { id: artisan._id, role: "artisan" };
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ Artisan Logged In:", artisan.email);
      return res.status(200).json({ message: "Login successful", role: "artisan", id: artisan._id });
    }

    let admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      await Session.deleteMany({ userId: admin._id });
      const session = new Session({
        sessionId: req.sessionID,
        userId: admin._id,
        role: "admin",
      });
      await session.save();
      req.session.user = { id: admin._id, role: "admin" };
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ Admin Logged In:", admin.email);
      return res.status(200).json({ message: "Login successful", role: "admin", id: admin._id });
    }

    return res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    console.error("❌ Error logging in:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/artisans/register", async (req, res) => {
  try {
    const { name, email, password, shopName, phoneNumber, bio } = req.body;
    if (!name || !email || !password || !shopName || !phoneNumber) {
      console.log("⚠️ Missing required fields:", { name, email, password, shopName, phoneNumber });
      return res.status(400).json({ error: "All fields are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      console.log("⚠️ Password validation failed:", passwordError);
      return res.status(400).json({ error: passwordError });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      console.log("⚠️ Phone number validation failed:", phoneError);
      return res.status(400).json({ error: phoneError });
    }

    const existingArtisan = await Artisan.findOne({ email });
    if (existingArtisan) {
      console.log("⚠️ Email already in use:", email);
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const artisan = new Artisan({
      name,
      email,
      password: hashedPassword,
      shopName,
      phoneNumber,
      bio,
      isActive: true,
    });

    await artisan.save();
    console.log("✅ Artisan Registered:", artisan.email);
    res.status(201).json({ message: "Artisan registered successfully", artisanId: artisan._id });
  } catch (err) {
    console.error("❌ Error registering artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      console.log("⚠️ Missing required fields:", { name, email, password, phoneNumber });
      return res.status(400).json({ error: "All fields are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      console.log("⚠️ Password validation failed:", passwordError);
      return res.status(400).json({ error: passwordError });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      console.log("⚠️ Phone number validation failed:", phoneError);
      return res.status(400).json({ error: phoneError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ Email already in use:", email);
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isActive: true,
    });

    await user.save();
    console.log("✅ User Registered:", user.email);
    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.error("❌ Error registering user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    await Session.deleteOne({ sessionId: req.sessionID });
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Error destroying session:", err.message);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      console.log("✅ Logged out");
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (err) {
    console.error("❌ Logout error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Order Routes
app.post("/api/orders", async (req, res) => {
  try {
    let userId = null;
    try {
      const session = await Session.findOne({ sessionId: req.sessionID });
      if (session && session.role === "user") {
        userId = session.userId;
        console.log("✅ Authenticated user creating order:", userId);
      } else {
        console.log("📥 Creating order as guest");
      }
    } catch (err) {
      console.log("⚠️ No session found, proceeding as guest");
    }

    const { products, totalAmount, artisanId } = req.body;
    if (!products || products.length === 0 || !totalAmount || !artisanId) {
      return res.status(400).json({ error: "Products, total amount, and artisan ID are required" });
    }

    for (const item of products) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({ error: "Each product must have productId, name, price, and quantity" });
      }
    }

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
    broadcast(`New order for artisan ${artisanId}`);
    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

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

app.get("/api/orders/customer", async (req, res) => {
  try {
    let userId = null;
    let email = req.query.email;

    try {
      const session = await Session.findOne({ sessionId: req.sessionID });
      if (session && session.role === "user") {
        userId = session.userId;
        console.log("📥 Fetching orders for authenticated customer:", userId);
      } else {
        console.log("📥 Fetching orders as guest");
      }
    } catch (err) {
      console.log("⚠️ No session found, proceeding to check for guest orders");
    }

    if (!userId && email) {
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "A valid email is required to fetch guest orders" });
      }

      console.log("📥 Fetching guest orders for email:", email);
      const orders = await Order.find({ customerEmail: email })
        .populate("products.productId", "name price")
        .sort({ createdAt: -1 });

      console.log("✅ Fetched Guest Orders Count:", orders.length);
      return res.status(200).json(orders);
    }

    if (userId) {
      console.log("📥 Fetching orders for customer:", userId);
      const orders = await Order.find({ userId })
        .populate("products.productId", "name price")
        .sort({ createdAt: -1 });
      console.log("✅ Fetched Customer Orders Count:", orders.length);
      return res.status(200).json(orders);
    }

    return res.status(400).json({ error: "Authentication or email is required to fetch orders" });
  } catch (err) {
    console.error("❌ Error fetching customer orders:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

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

app.put("/api/orders/admin/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });

    console.log("✅ Order Updated:", id, "New Status:", status);
    res.status(200).json(order);
  } catch (err) {
    console.error("❌ Error updating order status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// User Profile Routes
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

app.patch("/api/users/profile", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const { name, email, phoneNumber } = req.body;
    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ error: "Name, email, and phone number are required" });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }

    const updates = { name, email, phoneNumber };
    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    console.log("✅ Customer Profile Updated:", user.email);
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error updating customer profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/users/settings", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) return res.status(403).json({ error: "Access denied" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Customer Password Updated:", user.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating customer settings:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Product Routes
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

app.post("/api/products", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    console.log("📥 Adding product:", { name, price, description, category, stock });

    if (!req.file || !name || !price || !description) {
      console.log("⚠️ Missing required fields");
      return res.status(400).json({ error: "All fields are required" });
    }

    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) {
      console.log("⚠️ Access denied: User is not an artisan");
      return res.status(403).json({ error: "Access denied" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const newProduct = new Product({
      name,
      price: Number(price),
      image: imagePath,
      description,
      category: category || "Uncategorized",
      artisanId,
      stock: Number(stock) || 0,
    });

    await newProduct.save();
    console.log("✅ Product Added:", newProduct);
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.put("/api/products/:id", authenticate, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, stock } = req.body;
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const updateData = { name, price: Number(price), description, category, stock: Number(stock) };
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

// Comment Routes
app.get("/api/comments/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    console.log("📥 Fetching comments for customer:", userId);
    const comments = await Comment.find({ userId })
      .populate("productId", "name")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched Customer Comments Count:", comments.length);
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching customer comments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/comments/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    const { productId, text } = req.body;
    console.log("📥 Adding comment for user:", userId, "Product ID:", productId, "Text:", text);

    if (!productId || !text || !text.trim()) {
      console.log("⚠️ Missing required fields:", { productId, text });
      return res.status(400).json({ error: "Product ID and comment text are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("⚠️ Invalid product ID:", productId);
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("⚠️ Product not found:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    const order = await Order.findOne({ userId, "products.productId": productId });
    if (!order) {
      console.log("⚠️ User has not purchased product:", productId, "User:", userId);
      return res.status(403).json({ error: "You can only comment on products you have purchased" });
    }

    const comment = new Comment({
      text: text.trim(),
      userId,
      productId,
    });

    await comment.save();
    const populatedComment = await Comment.findById(comment._id)
      .populate("userId", "name email")
      .populate("productId", "name");

    console.log("✅ Comment Added:", populatedComment._id);
    broadcast(`New comment on product ${productId} for artisan ${product.artisanId}`);
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("❌ Error adding comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/products/customer", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.warn(`⚠️ Access denied for role: ${req.user.role}, user ID: ${req.user.id}`);
      return res.status(403).json({ error: "Access denied: You must be logged in as a customer." });
    }

    console.log(`📥 Fetching orders for user ID: ${userId}`);
    const orders = await Order.find({ userId });
    if (!orders || orders.length === 0) {
      console.log("✅ No orders found for user, returning empty product list.");
      return res.status(200).json([]);
    }

    const productIds = [...new Set(orders.flatMap((order) => order.products.map((p) => p.productId.toString())))];
    console.log(`📦 Found ${productIds.length} unique product IDs:`, productIds);

    if (productIds.length === 0) {
      console.log("✅ No products found in orders, returning empty list.");
      return res.status(200).json([]);
    }

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price image category stock")
      .lean();

    console.log("✅ Fetched Products Count:", products.length);
    if (products.length === 0) {
      console.log("⚠️ No matching products found in database for IDs:", productIds);
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("❌ Error fetching products for customer:", err.message, err.stack);
    res.status(500).json({ error: "Server error occurred while fetching products." });
  }
});

app.delete("/api/comments/customer/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid comment ID:", id);
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    console.log("📥 Deleting comment:", id, "for user:", userId);
    const comment = await Comment.findOneAndDelete({ _id: id, userId });
    if (!comment) {
      console.log("⚠️ Comment not found or not authorized for user:", userId);
      return res.status(404).json({ error: "Comment not found or you are not authorized to delete this comment" });
    }

    console.log("✅ Comment Deleted:", id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ Error deleting customer comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/comments/customer/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("⚠️ Invalid comment ID:", id);
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    console.log("📥 Fetching comment:", id, "for user:", userId);
    const comment = await Comment.findOne({ _id: id, userId })
      .populate("userId", "name email")
      .populate("productId", "name price image");

    if (!comment) {
      console.log("⚠️ Comment not found or not authorized for user:", userId);
      return res.status(404).json({ error: "Comment not found or you are not authorized to view this comment" });
    }

    console.log("✅ Fetched Comment:", comment._id);
    res.status(200).json(comment);
  } catch (err) {
    console.error("❌ Error fetching customer comment:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

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

app.get("/api/comments/artisan", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    console.log("📥 Fetching comments for artisan:", artisanId);
    const products = await Product.find({ artisanId });
    const productIds = products.map(product => product._id);

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

app.delete("/api/comments/artisan/:id", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await Comment.findById(id).populate("productId");
    if (!comment) return res.status(404).json({ error: "Comment not found" });

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

app.get("/api/comments/customer/recent", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    console.log("📥 Fetching recent comments for user:", userId);
    const comments = await Comment.find({
      userId,
      createdAt: { $gte: weekAgo },
    })
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("✅ Fetched Recent Comments Count:", comments.length);
    res.status(200).json(comments);
  } catch (err) {
    console.error("❌ Error fetching recent customer comments:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/comments/customer/count", authenticate, async (req, res) => {
  try {
    const userId = req.user.role === "user" ? req.user.id : null;
    if (!userId) {
      console.log("❌ Access denied: Not a user, role:", req.user.role);
      return res.status(403).json({ error: "Access denied" });
    }

    console.log("📥 Fetching comment count for user:", userId);
    const commentCount = await Comment.countDocuments({ userId });

    console.log("✅ Fetched Comment Count:", commentCount);
    res.status(200).json({ count: commentCount });
  } catch (err) {
    console.error("❌ Error fetching comment count:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Artisan Profile Routes
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

app.patch("/api/artisans/profile", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const { name, email, shopName, phoneNumber, bio } = req.body;
    if (!name || !email || !shopName || !phoneNumber) {
      return res.status(400).json({ error: "Name, email, shop name, and phone number are required" });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }

    const updates = { name, email, shopName, phoneNumber, bio };
    const artisan = await Artisan.findByIdAndUpdate(artisanId, updates, { new: true, runValidators: true });
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    console.log("✅ Artisan Profile Updated:", artisan.email);
    res.status(200).json(artisan);
  } catch (err) {
    console.error("❌ Error updating artisan profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/artisans/settings", authenticate, async (req, res) => {
  try {
    const artisanId = req.user.role === "artisan" ? req.user.id : null;
    if (!artisanId) return res.status(403).json({ error: "Access denied" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const artisan = await Artisan.findById(artisanId);
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });

    const isMatch = await bcrypt.compare(currentPassword, artisan.password);
    if (!isMatch) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    artisan.password = hashedPassword;
    await artisan.save();

    console.log("✅ Artisan Password Updated:", artisan.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating artisan settings:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin Profile Routes
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

app.patch("/api/admin/profile", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { name, email, phoneNumber } = req.body;
    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ error: "Name, email, and phone number are required" });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }

    const updates = { name, email, phoneNumber };
    const admin = await Admin.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    console.log("✅ Admin Profile Updated:", admin.email);
    res.status(200).json(admin);
  } catch (err) {
    console.error("❌ Error updating admin profile:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/admin/settings", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
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

// Admin Statistics and Management Routes
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
      totalUsers: totalUsers + totalArtisans,
    };

    console.log("✅ Fetched Admin Statistics:", stats);
    res.status(200).json(stats);
  } catch (err) {
    console.error("❌ Error fetching admin statistics:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isActive: true,
    });

    await user.save();
    console.log("✅ User Created by Admin:", user.email);
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/artisans/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { name, email, password, shopName, phoneNumber } = req.body;
    if (!name || !email || !password || !shopName || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      return res.status(400).json({ error: phoneError });
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
      isActive: true,
    });

    await artisan.save();
    console.log("✅ Artisan Created by Admin:", artisan.email);
    res.status(201).json(artisan);
  } catch (err) {
    console.error("❌ Error creating artisan:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/artisans/admin", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
    const artisans = await Artisan.find().select("-password");
    res.status(200).json(artisans);
  } catch (err) {
    console.error("❌ Error fetching artisans:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/users/admin/toggle/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error toggling user status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/artisans/admin/toggle/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Access denied" });
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) return res.status(404).json({ error: "Artisan not found" });
    artisan.isActive = !artisan.isActive;
    await artisan.save();
    res.status(200).json(artisan);
  } catch (err) {
    console.error("❌ Error toggling artisan status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Payment Route
app.post("/accept-payment", async (req, res) => {
  const { amount, currency, email, first_name, last_name, phone_number, tx_ref, orderId } = req.body;

  if (!amount || !currency || !email || !first_name || !phone_number || !tx_ref || !orderId) {
    return res.status(400).json({ error: "All fields are required except last_name" });
  }

  const phoneError = validatePhoneNumber(phone_number);
  if (phoneError) {
    return res.status(400).json({ error: phoneError });
  }

  try {
    const payment = new Payment({
      orderId,
      tx_ref,
      amount,
      status: "Pending",
      email,
    });
    await payment.save();

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    order.customerEmail = email;
    order.customerName = `${first_name} ${last_name || ""}`.trim();
    order.customerPhoneNumber = phone_number;
    await order.save();
    console.log("✅ Order updated with customer details:", { email, first_name, last_name, phone_number });

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
      last_name: last_name || "",
      phone_number,
      tx_ref,
      return_url: returnUrl,
    };

    const response = await axios.post("https://api.chapa.co/v1/transaction/initialize", body, header);

    payment.status = "Success"; // Mock success for testing
    await payment.save();

    order.paymentStatus = "Success";
    await order.save();
    console.log("✅ Order Payment Status Updated:", orderId);

    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Payment Error:", error.response?.data || error.message);
    res.status(400).json({
      message: "Payment processing failed",
      error: error.response?.data || error.message,
    });
  }
});

// Contact Form Route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      console.log("⚠️ Missing required fields:", { name, email, message });
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("⚠️ Invalid email format:", email);
      return res.status(400).json({ error: "Invalid email address" });
    }

    console.log("✅ Contact Form Submission:", { name, email, message });
    res.status(200).json({ message: "Message received successfully" });
  } catch (err) {
    console.error("❌ Error in contact form submission:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
});