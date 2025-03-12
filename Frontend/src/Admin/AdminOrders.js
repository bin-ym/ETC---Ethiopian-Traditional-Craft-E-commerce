import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminOrders = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/orders/admin", {
        withCredentials: true,
      });
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch orders.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(translateText(`Are you sure you want to change the status to "${newStatus}"?`, language))) return;

    try {
      await axios.put(
        `http://localhost:5000/api/orders/admin/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders(orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to update order status.", language));
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{translateText("Admin Orders", language)}</h1>
        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">{translateText("Loading orders...", language)}</p>
          </div>
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
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">{translateText("Order ID", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Customer", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Artisan", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Total", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Status", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Order Date", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Actions", language)}</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-2">{order._id}</td>
                      <td className="px-4 py-2">{order.userId?.name || translateText("Unknown Customer", language)}</td>
                      <td className="px-4 py-2">{order.artisanId?.name || translateText("Unknown Artisan", language)}</td>
                      <td className="px-4 py-2">{order.totalAmount.toFixed(2)} Br</td>
                      <td className="px-4 py-2">{translateText(order.status, language)}</td>
                      <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">{translateText("Pending", language)}</option>
                          <option value="Shipped">{translateText("Shipped", language)}</option>
                          <option value="Delivered">{translateText("Delivered", language)}</option>
                          <option value="Cancelled">{translateText("Cancelled", language)}</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      {translateText("No orders found.", language)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;