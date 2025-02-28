import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ArtisanDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    salesToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        withCredentials: true, // Send session cookie
      };

      const productResponse = await axios.get("http://localhost:5000/api/products", config);
      const orderResponse = await axios.get("http://localhost:5000/api/orders/artisan", config);

      const products = productResponse.data;
      const orders = orderResponse.data;

      const totalProducts = products.length;
      const totalOrders = orders.length;
      const salesToday = orders
        .filter(order => new Date(order.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({ totalProducts, totalOrders, salesToday });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch dashboard stats. Please log in.");
      console.error("❌ Error fetching dashboard stats:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Artisan Dashboard</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          Loading...
        </p>
      )}
      {error && (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="p-6 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">Total Products</h2>
              <p className="text-2xl">{stats.totalProducts}</p>
            </div>
            <div className="p-6 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">Total Orders</h2>
              <p className="text-2xl">{stats.totalOrders}</p>
            </div>
            <div className="p-6 bg-white rounded shadow-md">
              <h2 className="text-xl font-semibold">Sales Today</h2>
              <p className="text-2xl">${stats.salesToday.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Link
                to="/artisan/products"
                className="p-4 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Manage Products
              </Link>
              <Link
                to="/artisan/orders"
                className="p-4 text-white bg-green-600 rounded hover:bg-green-700"
              >
                View Orders
              </Link>
              <Link
                to="/artisan/profile"
                className="p-4 text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArtisanDashboard;