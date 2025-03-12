import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const NavbarCustomer = () => {
  const { language } = useLanguage(); // Added hook
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      console.log("✅ Logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    navigate("/");
  };

  return (
    <nav className="p-4 text-white bg-blue-600">
      <div className="container flex items-center justify-between mx-auto">
        <Link to="/customer" className="text-xl font-bold">{translateText("Customer Portal", language)}</Link>
        <div className="space-x-4">
          <Link to="/customer" className="text-lg hover:underline">{translateText("Dashboard", language)}</Link>
          <Link to="/products" className="hover:underline">{translateText("Shop", language)}</Link>
          <Link to="/cart" className="hover:underline">{translateText("Cart", language)}</Link>
          <Link to="/customer/orders" className="hover:underline">{translateText("Orders", language)}</Link>
          <Link to="/customer/comments" className="hover:underline">{translateText("Comments", language)}</Link>
          <Link to="/customer/profile" className="hover:underline">{translateText("Profile", language)}</Link>
          <button
            onClick={handleLogout}
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
          >
            {translateText("Logout", language)}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarCustomer;