import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Adjust path if needed
import { translateText } from "../utils/translate";

const NavbarArtisan = () => {
  const { language, toggleLanguage } = useLanguage(); // Get language and toggle function
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      console.log("✅ Logged out");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleToggleLanguage = () => {
    try {
      toggleLanguage();
    } catch (err) {
      console.error("Language toggle failed:", err);
    }
  };

  return (
    <nav className="p-4 text-white bg-indigo-600">
      <div className="container flex items-center justify-between mx-auto">
        <Link to="/artisan" className="text-xl font-bold">
          {translateText("Artisan Portal", language)}
        </Link>
        <div className="space-x-4">
          <Link to="/artisan" className="hover:underline">
            {translateText("Dashboard", language)}
          </Link>
          <Link to="/artisan/products" className="hover:underline">
            {translateText("Products", language)}
          </Link>
          <Link to="/artisan/orders" className="hover:underline">
            {translateText("Orders", language)}
          </Link>
          <Link to="/artisan/comments" className="hover:underline">
            {translateText("Comments", language)}
          </Link>
          <Link to="/artisan/profile" className="hover:underline">
            {translateText("Profile", language)}
          </Link>
          <button
            onClick={handleLogout}
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
          >
            {translateText("Logout", language)}
          </button>
          <button
            onClick={handleToggleLanguage}
            className="px-3 py-1 text-sm text-gray-900 transition duration-200 bg-white rounded-md shadow-md hover:bg-yellow-400 hover:text-gray-900"
          >
            {language === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarArtisan;