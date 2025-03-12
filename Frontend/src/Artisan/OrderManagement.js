import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const OrderManagement = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/orders/artisan", {
        withCredentials: true,
      });
      if (!Array.isArray(response.data)) {
        throw new Error(translateText("Unexpected response format: not an array", language));
      }
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch orders. Please try again.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(translateText(`Are you sure you want to change the status to "${newStatus}"?`, language))) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/orders/artisan/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders(orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      const errorMsg = err.response?.status === 404
        ? translateText("Order not found or you don’t have permission to update it.", language)
        : err.response?.data?.error || translateText("Failed to update order status.", language);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">{translateText("Order Management", language)}</h1>

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
          {error.includes("Please log in") && (
            <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
              {translateText("Go to Login", language)}
            </Link>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4">
            <label htmlFor="statusFilter" className="mr-2">{translateText("Filter by Status:", language)}</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">{translateText("All", language)}</option>
              <option value="Pending">{translateText("Pending", language)}</option>
              <option value="Shipped">{translateText("Shipped", language)}</option>
              <option value="Cancelled">{translateText("Cancelled", language)}</option>
            </select>
          </div>

          <div className="p-6 bg-white rounded shadow-md">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">{translateText("Customer", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Total", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Status", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Order Date", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Actions", language)}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-2">{order.userId?.name || translateText("Unknown Customer", language)}</td>
                      <td className="px-4 py-2">{order.totalAmount.toFixed(2)} Br</td>
                      <td className="px-4 py-2">{translateText(order.status, language)}</td>
                      <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => handleViewOrder(order)}
                        >
                          {translateText("View", language)}
                        </button>
                        {order.status === "Pending" && (
                          <>
                            <button
                              className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                              onClick={() => handleStatusChange(order._id, "Cancelled")}
                            >
                              {translateText("Cancel", language)}
                            </button>
                            <button
                              className="px-4 py-1 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                              onClick={() => handleStatusChange(order._id, "Shipped")}
                            >
                              {translateText("Ship", language)}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                      {translateText("No orders found.", language)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">{translateText("Order Details", language)}</h2>
            <div className="space-y-2">
              <p><strong>{translateText("Order ID", language)}:</strong> {selectedOrder._id}</p>
              <p><strong>{translateText("Customer", language)}:</strong> {selectedOrder.userId?.name || translateText("Unknown Customer", language)}</p>
              <p><strong>{translateText("Total Amount", language)}:</strong> {selectedOrder.totalAmount.toFixed(2)} Br</p>
              <p><strong>{translateText("Status", language)}:</strong> {translateText(selectedOrder.status, language)}</p>
              <p><strong>{translateText("Date", language)}:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <div>
                <strong>{translateText("Products", language)}:</strong>
                <ul className="ml-6 list-disc">
                  {selectedOrder.products.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.price} Br x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="px-6 py-2 text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                {translateText("Close", language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;