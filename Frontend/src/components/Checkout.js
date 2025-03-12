import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Checkout = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], totalAmount = 0 } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "", // Changed from first_name and last_name to match Signup/User
    phoneNumber: "", // Changed to match Signup/User
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const finalTotal = totalAmount > 0 
    ? totalAmount 
    : cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0);

  // Fetch user details if logged in
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log("Fetching user details from:", `${API_URL}/api/session/user`);
        const response = await axios.get(`${API_URL}/api/session/user`, {
          withCredentials: true,
        });
        const user = response.data;
        console.log("User data received:", user);

        if (user && Object.keys(user).length > 0) {
          setIsLoggedIn(true);
          setFormData({
            email: user.email || "",
            name: user.name || "", // Use full name from User model
            phoneNumber: user.phoneNumber || "",
          });
        } else {
          console.log("No user data found in response.");
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err.response?.status, err.response?.data || err.message);
        setIsLoggedIn(false);
      }
    };

    fetchUserDetails();
  }, []);

  // Validate cart items and fetch artisanId if missing
  useEffect(() => {
    const validateCartItems = async () => {
      if (!cartItems || cartItems.length === 0) {
        setError(translateText("Cart is empty. Add items before checkout.", language));
        return;
      }

      const missingFields = cartItems.some(item => 
        !item.id && !item._id || 
        !item.name || 
        !item.price || 
        !item.quantity
      );

      if (missingFields) {
        setError(translateText("Some cart items are missing required fields (ID, name, price, quantity).", language));
        return;
      }

      const missingArtisanId = cartItems.some(item => !item.artisanId);
      if (missingArtisanId) {
        try {
          const updatedCartItems = await Promise.all(cartItems.map(async (item) => {
            if (item.artisanId) return item;
            const productId = item.id || item._id;
            const response = await axios.get(`${API_URL}/api/products/${productId}`);
            return { ...item, artisanId: response.data.artisanId };
          }));
          location.state.cartItems = updatedCartItems;
        } catch (err) {
          setError(translateText("Failed to fetch artisan information for some products.", language));
          console.error("Error fetching artisanId:", err);
        }
      }

      const artisanIds = [...new Set(cartItems.map(item => item.artisanId).filter(Boolean))];
      if (artisanIds.length > 1) {
        setError(translateText("Cart contains items from multiple artisans. Please checkout items from one artisan at a time.", language));
      }
    };

    validateCartItems();
  }, [cartItems, location.state, language]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateOrderAndPay = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      setError(translateText("Cart is empty. Add items before checkout.", language));
      return;
    }
  
    const artisanId = cartItems[0]?.artisanId;
    if (!artisanId) {
      setError(translateText("Unable to determine the artisan for your cart items.", language));
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      const orderData = {
        products: cartItems.map(item => ({
          productId: item.id || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: finalTotal,
        artisanId,
      };
  
      console.log("📤 Creating Order with Data:", orderData);
      const orderResponse = await axios.post(`${API_URL}/api/orders`, orderData, {
        withCredentials: true,
      });
      const orderId = orderResponse.data._id;
      console.log("✅ Order Created:", orderId);
  
      const paymentData = {
        amount: finalTotal.toFixed(2),
        currency: "ETB",
        email: formData.email,
        first_name: formData.name.split(" ")[0] || formData.name, // Split name for Chapa
        last_name: formData.name.split(" ").slice(1).join(" ") || "", // Handle single-word names
        phone_number: formData.phoneNumber,
        tx_ref: `txn-${orderId}-${Date.now()}`,
        orderId,
      };
  
      console.log("📤 Sending Payment Data:", paymentData);
      const paymentResponse = await axios.post(`${API_URL}/accept-payment`, paymentData, {
        withCredentials: true,
      });
      console.log("✅ Payment Response:", paymentResponse.data);
  
      if (paymentResponse.data.status === "success") {
        window.open(paymentResponse.data.data.checkout_url, "_blank");
        setShowPopup(false);
        setTimeout(() => navigate("/customer/orders"), 1000);
      } else {
        setError(translateText("Payment initiation failed.", language));
      }
    } catch (err) {
      console.error("❌ Payment Error Full Details:", err.response?.data || err);
      setError(translateText("Payment failed: ", language) + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-100">
      <div className="container px-6 mx-auto lg:px-12">
        <h2 className="mb-8 text-3xl font-extrabold text-center">
          {translateText("💳 Checkout", language)}
        </h2>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">{translateText("Your cart is empty.", language)}</p>
        ) : (
          <>
            <ul className="p-4 bg-white rounded-lg shadow-md">
              {cartItems.map((item) => (
                <li key={item.id || item._id} className="flex justify-between p-2 border-b">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{((item.price || 0) * (item.quantity || 0)).toFixed(2)} Br</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xl font-semibold text-center">
              {translateText("Total", language)}: {finalTotal.toFixed(2)} Br
            </p>
            <button
              onClick={() => setShowPopup(true)}
              disabled={loading || error}
              className="w-full py-3 mt-6 text-lg font-bold text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {translateText("💳 Pay with Chapa", language)}
            </button>
          </>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 bg-white rounded-lg shadow-lg w-96">
              <h3 className="mb-4 text-xl font-semibold text-center">
                {translateText("Enter Payment Details", language)}
              </h3>
              <form onSubmit={handleCreateOrderAndPay}>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    {translateText("Email", language)}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={translateText("Enter your email", language)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    {translateText("Full Name", language)} {/* Updated label */}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={translateText("Enter your full name", language)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    {translateText("Phone Number", language)}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={translateText("Enter your phone number", language)}
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-white transition bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? translateText("Processing...", language) : translateText("Submit Payment", language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    {translateText("Cancel", language)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;