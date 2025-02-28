import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const NavbarArtisan = () => {
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
    <nav className="p-4 text-white bg-indigo-600">
      <div className="container flex items-center justify-between mx-auto">
        <Link to="/artisan" className="text-xl font-bold">Artisan Portal</Link>
        <div className="space-x-4">
          <Link to="/artisan" className="hover:underline">Dashboard</Link>
          <Link to="/artisan/products" className="hover:underline">Products</Link>
          <Link to="/artisan/orders" className="hover:underline">Orders</Link>
          <Link to="/artisan/profile" className="hover:underline">Profile</Link>
          <button
            onClick={handleLogout}
            className="px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarArtisan;