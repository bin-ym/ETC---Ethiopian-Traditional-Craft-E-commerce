import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const CustomerDashboard = () => {
  const [customerName, setCustomerName] = useState("");
  const [recentOrdersCount, setRecentOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      // No token needed; use session cookie
      const profileResponse = await axios.get("http://localhost:5000/api/users/profile", {
        withCredentials: true, // Send session cookie
      });
      setCustomerName(profileResponse.data.name || "Customer");

      const ordersResponse = await axios.get("http://localhost:5000/api/orders/customer", {
        withCredentials: true, // Send session cookie
      });
      const recentOrders = ordersResponse.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      });
      setRecentOrdersCount(recentOrders.length);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data. Please log in.");
      console.error("Error fetching dashboard data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Customer Dashboard</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          Loading dashboard...
        </p>
      )}

      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={fetchCustomerData}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <p className="text-lg">
            Welcome back, <span className="font-semibold">{customerName}</span>! Here’s what’s happening with your account.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-4 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <p className="text-2xl">{recentOrdersCount}</p>
              <p className="text-sm text-gray-500">Orders in the last 7 days</p>
              <Link to="/customer/orders" className="block mt-2 text-blue-600 hover:underline">
                View All Orders
              </Link>
            </div>
            <div className="p-4 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-sm">Manage your personal details</p>
              <Link to="/customer/profile" className="block mt-2 text-blue-600 hover:underline">
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-xl font-semibold">Quick Actions</h2>
            <div className="flex space-x-4">
              <Link
                to="/products"
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                Shop Now
              </Link>
              <Link
                to="/cart"
                className="px-4 py-2 text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;