import React, { useState } from "react";
import axios from "axios";

const Checkout = ({ cartItems = [] }) => {  // ✅ Set default value to empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    if (cartItems.length === 0) {  // ✅ Prevent empty cart checkout
      setError("Cart is empty. Add items before checkout.");
      return;
    }

    setLoading(true);
    setError("");

    const paymentData = {
      amount: cartItems.reduce((total, item) => total + item.price, 0),
      currency: "ETB",
      email: "customer@example.com",
      first_name: "John",
      last_name: "Doe",
      phone_number: "0912345678",
      tx_ref: `txn-${Date.now()}`,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/accept-payment", paymentData);
      window.location.href = response.data.data.checkout_url;
    } catch (err) {
      console.error("❌ Payment Error:", err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {cartItems.length === 0 ? (  // ✅ Show message if cart is empty
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (  // ✅ Safe use of `.map()`
              <li key={index}>{item.name} - ${item.price}</li>
            ))}
          </ul>
          <p>Total: ${cartItems.reduce((total, item) => total + item.price, 0)}</p>
          <button onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay with Chapa"}
          </button>
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Checkout;
