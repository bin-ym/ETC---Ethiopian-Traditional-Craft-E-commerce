import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const NavbarCustomer = () => {
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
        <Link to="/customer" className="text-xl font-bold">Customer Portal</Link>
        <div className="space-x-4">
          <Link to="/customer" className="text-lg hover:underline">Dashboard</Link>
          <Link to="/products" className="hover:underline">Shop</Link>
          <Link to="/cart" className="hover:underline">Cart</Link>
          <Link to="/customer/orders" className="hover:underline">Orders</Link>
          <Link to="/customer/profile" className="hover:underline">Profile</Link>
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

export default NavbarCustomer;