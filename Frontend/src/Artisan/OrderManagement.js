import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const OrderManagement = () => {
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
      console.log("Response Status:", response.status);
      console.log("Raw Response Data:", response.data);
      if (!Array.isArray(response.data)) {
        throw new Error("Unexpected response format: not an array");
      }
      console.log("Orders Fetched:", response.data); // Debug fetched orders
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch orders. Please try again.");
      console.error("Error fetching orders:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;

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
      console.log(`✅ Order Status Changed to ${newStatus}:`, orderId);
    } catch (err) {
      const errorMsg = err.response?.status === 404
        ? "Order not found or you don’t have permission to update it."
        : err.response?.data?.error || "Failed to update order status.";
      setError(errorMsg);
      console.error("Error updating order:", err.response?.data || err.message);
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
      <h1 className="mb-4 text-3xl font-bold">Order Management</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          Loading orders...
        </p>
      )}

      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
          {error.includes("Please log in") && (
            <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
              Go to Login
            </Link>
          )}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4">
            <label htmlFor="statusFilter" className="mr-2">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="p-6 bg-white rounded shadow-md">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Order Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-4 py-2">{order.userId?.name || "Unknown Customer"}</td>
                      <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-2">{order.status}</td>
                      <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </button>
                        {order.status === "Pending" && (
                          <>
                            <button
                              className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                              onClick={() => handleStatusChange(order._id, "Cancelled")}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-1 text-white bg-yellow-500 rounded hover:bg-yellow-600"
                              onClick={() => handleStatusChange(order._id, "Shipped")}
                            >
                              Ship
                            </button>
                          </>
                        )}
                        {order.status === "Shipped" && (
                          <button
                            className="px-4 py-1 text-white bg-green-500 rounded hover:bg-green-600"
                            onClick={() => handleStatusChange(order._id, "Delivered")}
                          >
                            Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                      No orders found.
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
            <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
            <div className="space-y-2">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Customer:</strong> {selectedOrder.userId?.name || "Unknown Customer"}</p>
              <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <div>
                <strong>Products:</strong>
                <ul className="ml-6 list-disc">
                  {selectedOrder.products.map((item, index) => (
                    <li key={index}>
                      {item.name} - ${item.price} x {item.quantity}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;