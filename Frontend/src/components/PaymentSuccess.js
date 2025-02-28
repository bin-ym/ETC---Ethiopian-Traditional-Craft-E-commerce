import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen py-12 bg-gray-100">
      <div className="container px-6 mx-auto text-center lg:px-12">
        <h2 className="mb-8 text-3xl font-extrabold text-green-600">
          🎉 Payment Successful!
        </h2>
        <p className="text-xl text-gray-700">
          You paid <span className="font-semibold">${new URLSearchParams(window.location.search).get("amount") || "N/A"}</span> successfully.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 mt-6 text-lg font-bold text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          🛍️ Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;