import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const Navbar = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLoggedIn = !!role;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    console.log("✅ Logged out");
    navigate("/");
  };

  const homePath = role === "user" ? "/customer" : "/";

  return (
    <nav className="text-white bg-gray-900 shadow-lg">
      <div className="container flex items-center justify-between px-6 py-4 mx-auto">
        <Link to="/" className="text-2xl font-bold text-yellow-400">
          {translateText("Ethiopian Crafts", language)}
        </Link>
        <ul className="flex items-center space-x-6">
          <li>
            <Link to={homePath} className="transition duration-300 hover:text-yellow-400">
              {translateText("Home", language)}
            </Link>
          </li>
          <li>
            <Link to="/products" className="transition duration-300 hover:text-yellow-400">
              {translateText("Products", language)}
            </Link>
          </li>
          <li>
            <Link to="/cart" className="transition duration-300 hover:text-yellow-400">
              <FaShoppingCart className="inline-block mr-1" /> {translateText("Cart", language)}
            </Link>
          </li>
          {isLoggedIn ? (
            <li>
              <button
                onClick={handleLogout}
                className="text-sm transition duration-300 hover:text-yellow-400 focus:outline-none"
              >
                {translateText("Logout", language)}
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="transition duration-300 hover:text-yellow-400">
                {translateText("Login", language)}
              </Link>
            </li>
          )}
          <li>
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 text-sm text-gray-900 transition duration-200 bg-white rounded-md shadow-md hover:bg-yellow-400 hover:text-gray-900"
            >
              {language === "en" ? "አማርኛ" : "English"}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;