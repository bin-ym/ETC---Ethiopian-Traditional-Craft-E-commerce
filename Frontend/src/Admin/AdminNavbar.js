import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminNavbar = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("🚪 Attempting logout...");
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      console.log("✅ Logout successful");
      navigate("/login");
    } catch (err) {
      console.error("❌ Logout failed:", err.response?.data || err.message);
      navigate("/login"); // Navigate even on error to ensure session clears
    }
  };

  const handleToggleLanguage = () => {
    console.log("🌐 Toggling language from:", language);
    try {
      toggleLanguage();
      console.log("✅ Language toggled to:", language === "en" ? "am" : "en");
    } catch (err) {
      console.error("❌ Language toggle failed:", err);
    }
  };

  return (
    <header className="py-4 bg-blue-600 shadow-lg">
      <div className="container flex items-center justify-between px-6 mx-auto">
        <h1 className="text-2xl font-bold text-white">{translateText("Admin Panel", language)}</h1>
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="/admin/dashboard" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Dashboard", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Products", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/orders" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Orders", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Users", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/comments" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("View Comments", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/profile" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Profile", language)}
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="text-white transition duration-200 hover:text-blue-200">
                {translateText("Settings", language)}
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-white transition duration-200 bg-red-500 rounded hover:bg-red-600"
              >
                {translateText("Logout", language)}
              </button>
            </li>
            <li>
              <button
                onClick={handleToggleLanguage}
                className="px-3 py-1 text-sm text-gray-900 transition duration-200 bg-white rounded-md shadow-md hover:bg-yellow-400 hover:text-gray-900"
              >
                {language === "en" ? "አማርኛ" : "English"}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default AdminNavbar;