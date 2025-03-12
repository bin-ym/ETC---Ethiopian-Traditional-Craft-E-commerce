import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const CustomerDashboard = () => {
  const { language } = useLanguage(); // Added hook
  const [customerName, setCustomerName] = useState("");
  const [recentOrdersCount, setRecentOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, [language]); // Added language to dependencies

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileResponse = await axios.get("http://localhost:5000/api/users/profile", {
        withCredentials: true,
      });
      setCustomerName(profileResponse.data.name || translateText("Customer", language));

      const ordersResponse = await axios.get("http://localhost:5000/api/orders/customer", {
        withCredentials: true,
      });
      const recentOrders = ordersResponse.data.filter(order => {
        const orderDate = new Date(order.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      });
      setRecentOrdersCount(recentOrders.length);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to load dashboard data. Please log in.", language));
      console.error("Error fetching dashboard data:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">{translateText("Customer Dashboard", language)}</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          {translateText("Loading dashboard...", language)}
        </p>
      )}

      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={fetchCustomerData}
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
        <div className="space-y-6">
          <p className="text-lg">
            {translateText("Welcome back", language)}, <span className="font-semibold">{customerName}</span>! {translateText("Here’s what’s happening with your account.", language)}
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-4 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">{translateText("Recent Orders", language)}</h2>
              <p className="text-2xl">{recentOrdersCount}</p>
              <p className="text-sm text-gray-500">{translateText("Orders in the last 7 days", language)}</p>
              <Link to="/customer/orders" className="block mt-2 text-blue-600 hover:underline">
                {translateText("View All Orders", language)}
              </Link>
            </div>
            <div className="p-4 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">{translateText("Profile", language)}</h2>
              <p className="text-sm">{translateText("Manage your personal details", language)}</p>
              <Link to="/customer/profile" className="block mt-2 text-blue-600 hover:underline">
                {translateText("Edit Profile", language)}
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 text-xl font-semibold">{translateText("Quick Actions", language)}</h2>
            <div className="flex space-x-4">
              <Link
                to="/products"
                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              >
                {translateText("Shop Now", language)}
              </Link>
              <Link
                to="/cart"
                className="px-4 py-2 text-white bg-yellow-600 rounded hover:bg-yellow-700"
              >
                {translateText("View Cart", language)}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;