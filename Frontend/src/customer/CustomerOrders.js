import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const CustomerOrders = () => {
  const { language } = useLanguage(); // Added hook
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [language]); // Added language to dependencies

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/orders/customer", {
        withCredentials: true,
      });
      console.log("Fetched Customer Orders:", response.data);
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch orders. Please log in.", language));
      console.error("Error fetching orders:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (order) => {
    navigate("/payment-page", {
      state: {
        orderId: order._id,
        amount: order.totalAmount,
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        tx_ref: `tx-${order._id}-${Date.now()}`,
      },
    });
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">{translateText("Your Orders", language)}</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          {translateText("Loading orders...", language)}
        </p>
      )}

      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {translateText("Retry", language)}
          </button>
          <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
            {translateText("Go to Login", language)}
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div className="p-6 bg-white rounded shadow-md">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">{translateText("Order ID", language)}</th>
                <th className="px-4 py-2 text-left">{translateText("Total", language)}</th>
                <th className="px-4 py-2 text-left">{translateText("Order Status", language)}</th>
                <th className="px-4 py-2 text-left">{translateText("Payment Status", language)}</th>
                <th className="px-4 py-2 text-left">{translateText("Order Date", language)}</th>
                <th className="px-4 py-2 text-left">{translateText("Actions", language)}</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-2">{order._id}</td>
                    <td className="px-4 py-2">{order.totalAmount.toFixed(2)} Br</td>
                    <td className="px-4 py-2">{translateText(order.status, language)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          order.paymentStatus === "Success"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {translateText(order.paymentStatus, language)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="flex px-4 py-2 space-x-2">
                      <Link
                        to={`/customer/orders/${order._id}`}
                        className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        {translateText("View Details", language)}
                      </Link>
                      {order.paymentStatus === "Pending" && (
                        <button
                          onClick={() => handlePayNow(order)}
                          className="px-4 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                        >
                          {translateText("Pay Now", language)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                    {translateText("No orders found.", language)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;