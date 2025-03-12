import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../contexts/CartContext";
import { useLanguage } from "../contexts/LanguageContext"; // Import LanguageContext
import { translateText } from "../utils/translate"; // Import translate utility

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(0);
  const { addToCart } = useContext(CartContext);
  const { language } = useLanguage(); // Get current language

  const fetchProduct = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("📤 Fetching product with ID:", id);
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      const productData = response.data;
      if (!productData) throw new Error(translateText("Product not found.", language));
      setProduct(productData);
      setStock(productData.stock || 0); // Ensure stock is set correctly
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
      setError(err.response?.data?.error || translateText("Failed to fetch product details.", language));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id, language]);

  const handleAddToCart = () => {
    if (!product) {
      setError(translateText("No product to add.", language));
      return;
    }
    if (stock <= 0) {
      setError(translateText("Sorry, this product is out of stock!", language));
      return;
    }
    if (quantity > stock) {
      setError(translateText(`Only ${stock} items left in stock!`, language));
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare cart item
      const cartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image ? `${API_URL}${product.image}` : "https://via.placeholder.com/150",
        quantity: quantity,
        artisanId: product.artisanId,
        stock: product.stock, // Include stock for validation in Cart
      };

      // Add to cart
      addToCart(cartItem);
      setStock((prevStock) => prevStock - quantity); // Update local stock
      setSuccess(translateText(`${quantity} x ${product.name} added to cart!`, language));
      setQuantity(1); // Reset quantity
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Add to Cart Error:", err);
      setError(translateText("Failed to add to cart.", language));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center bg-gray-100">
        <svg
          className="w-8 h-8 mx-auto text-indigo-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-2 text-gray-600">{translateText("Loading product details...", language)}</p>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-5xl p-6 mx-auto mt-16 text-center bg-gray-100 rounded-lg shadow-md">
        <p className="font-medium text-red-500">{error}</p>
        <button
          onClick={fetchProduct}
          className="px-4 py-2 mt-2 text-white transition duration-300 bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {translateText("Retry", language)}
        </button>
        <Link
          to="/products"
          className="block mt-2 text-indigo-600 hover:underline"
        >
          {translateText("Back to Product List", language)}
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-100">
        {translateText("Product not found.", language)}
      </div>
    );
  }

  const imageUrl = product.image
    ? `${API_URL}${product.image}`
    : "https://via.placeholder.com/150";

  return (
    <div className="max-w-5xl p-6 mx-auto mt-16 bg-gray-100 rounded-lg shadow-md">
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-block px-4 py-2 text-indigo-600 transition duration-300 border border-indigo-600 rounded-md hover:bg-indigo-100"
        >
          {translateText("Back to Product List", language)}
        </Link>
      </div>
      <div className="flex flex-col gap-8 p-6 bg-white rounded-lg lg:flex-row">
        <div className="lg:w-1/2">
          <img
            src={imageUrl}
            alt={product.name}
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            className="object-cover w-full rounded-lg shadow-md h-96"
          />
        </div>
        <div className="space-y-4 lg:w-1/2">
          <h1 className="text-3xl font-bold text-indigo-600">{product.name}</h1>
          <p className="text-xl text-gray-700">{product.price.toFixed(2)} Br</p>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-gray-600">
            {translateText("Category", language)}:{" "}
            <span className="font-medium">{product.category || translateText("Uncategorized", language)}</span>
          </p>
          <p className={`text-gray-600 ${stock <= 0 ? "text-red-500" : ""}`}>
            {translateText("Stock", language)}:{" "}
            <span className="font-medium">
              {stock > 0 ? stock : translateText("Out of stock", language)}
            </span>
          </p>
          {stock > 0 && (
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-gray-700">{translateText("Quantity", language)}:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= stock) setQuantity(value);
                }}
                min="1"
                max={stock}
                className="w-16 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 text-white font-semibold rounded-md transition duration-300 ${
              stock > 0
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading || stock <= 0}
          >
            {loading ? translateText("Adding...", language) : translateText("Add to Cart", language)}
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;