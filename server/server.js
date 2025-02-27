const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const CHAPA_AUTH_KEY = process.env.CHAPA_AUTH_KEY; // Load Chapa API key

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Middleware
app.use(express.json());
app.use(cors());

// Serve images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads")); // Save images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});
const upload = multer({ storage });

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }, // Store image path
  description: { type: String, required: true },
});
const Product = mongoose.model("Product", productSchema);

// ✅ Route to add a new product with image upload
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!req.file || !name || !price || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const imagePath = `/uploads/${req.file.filename}`; // Save image path
    const newProduct = new Product({ name, price, image: imagePath, description });
    await newProduct.save();

    console.log("✅ Product Added:", newProduct);
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("❌ Error adding product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Route to fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Route for Chapa Payment Integration
app.post("/api/accept-payment", async (req, res) => {
  const { amount, currency, email, first_name, last_name, phone_number, tx_ref } = req.body;
  try {
    const header = {
      headers: {
        Authorization: `Bearer ${CHAPA_AUTH_KEY}`, // Use Chapa API key from .env
        "Content-Type": "application/json",
      },
    };

    const body = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      return_url: "http://localhost:5173/", // Set your return URL
    };

    const response = await axios.post("https://api.chapa.co/v1/transaction/initialize", body, header);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("❌ Payment Error:", error.response?.data || error.message);
    res.status(400).json({ message: "Payment processing failed", error: error.response?.data || error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
