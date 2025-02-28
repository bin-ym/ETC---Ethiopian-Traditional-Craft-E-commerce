import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); // Check if user is logged in
  const isLoggedIn = !!role; // True if role exists (user or artisan)

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    console.log("✅ Logged out");
    navigate("/");
  };

  // Determine "Home" link based on role
  const homePath = role === "user" ? "/customer" : "/";

  return (
    <nav className="text-white bg-gray-800 shadow">
      <div className="container flex items-center justify-between px-4 py-3 mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary">
          Ethiopian Crafts
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link to={homePath} className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-primary">
              <FaShoppingCart className="inline-block mr-1" /> Cart
            </Link>
          </li>
          {isLoggedIn ? (
            <li>
              <button
                onClick={handleLogout}
                className="hover:text-primary focus:outline-none"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="hover:text-primary">
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;