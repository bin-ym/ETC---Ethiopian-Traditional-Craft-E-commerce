import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="mb-4 text-3xl font-bold text-green-700">🎉 Payment Successful!</h1>
      <p className="text-lg text-gray-700">Thank you for your purchase.</p>
      <button
        onClick={() => navigate("/ETC---Ethiopian-Traditional-Craft-E-commerce")}
        className="px-6 py-2 mt-6 text-lg font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
      >
        🛍️ Continue Shopping
      </button>
    </div>
  );
};

export default PaymentSuccess;
