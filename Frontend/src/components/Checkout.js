import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Checkout = () => {
  const location = useLocation();
  const { cartItems = [], totalAmount = 0 } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const finalTotal = totalAmount > 0 
    ? totalAmount 
    : cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!cartItems || cartItems.length === 0) {
      setError("Cart is empty. Add items before checkout.");
      return;
    }
    setLoading(true);
    setError("");
    const paymentData = {
      amount: finalTotal.toFixed(2),
      currency: "ETB",
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      tx_ref: `txn-${Date.now()}`,
      return_url: "http://localhost:3000/payment-success",
    };
    console.log("📤 Sending Payment Data:", paymentData);
    try {
      const response = await axios.post("http://localhost:5000/accept-payment", paymentData);
      console.log("✅ Payment Response:", response.data);
      if (response.data.status === "success") {
        window.open(response.data.data.checkout_url, "_blank");
        setShowPopup(false);
      } else {
        setError("Payment initiation failed.");
      }
    } catch (err) {
      console.error("❌ Payment Error Full Details:", err.response?.data);
      setError("Payment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-100">
      <div className="container px-6 mx-auto lg:px-12">
        <h2 className="mb-8 text-3xl font-extrabold text-center">
          💳 Checkout
        </h2>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          <>
            <ul className="p-4 bg-white rounded-lg shadow-md">
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between p-2 border-b">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xl font-semibold text-center">
              Total: ${finalTotal.toFixed(2)}
            </p>
            <button
              onClick={() => setShowPopup(true)}
              disabled={loading}
              className="w-full py-3 mt-6 text-lg font-bold text-white transition bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Processing..." : "💳 Pay with Chapa"}
            </button>
          </>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}

        {/* Popup Form */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="p-6 bg-white rounded-lg shadow-lg w-96">
              <h3 className="mb-4 text-xl font-semibold text-center">
                Enter Payment Details
              </h3>
              <form onSubmit={handlePayment}>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-bold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-white transition bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Submit Payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Cancel
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