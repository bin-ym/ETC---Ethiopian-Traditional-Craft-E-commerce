import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminDashboard = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/statistics", {
        withCredentials: true,
      });
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch statistics.", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{translateText("Admin Dashboard", language)}</h1>
        <p className="mb-6 text-lg text-gray-700">
          {translateText("Welcome to the Admin Dashboard! Below are key statistics about the platform.", language)}
        </p>

        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">{translateText("Loading statistics...", language)}</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchStatistics}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {translateText("Retry", language)}
            </button>
          </div>
        )}
        {stats && !loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 text-center rounded-lg shadow-md bg-blue-50">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">{translateText("Total Products", language)}</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <div className="p-6 text-center rounded-lg shadow-md bg-blue-50">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">{translateText("Total Orders", language)}</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <div className="p-6 text-center rounded-lg shadow-md bg-blue-50">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">{translateText("Total Users", language)}</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;