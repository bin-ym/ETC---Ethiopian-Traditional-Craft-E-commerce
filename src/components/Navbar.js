import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Navbar = () => {
  return (
    <nav className="text-white bg-gray-800 shadow">
      <div className="container flex items-center justify-between px-4 py-3 mx-auto">
        <Link to="/" className="text-2xl font-bold text-primary">
          Ethiopian Crafts
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link to="/products" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-primary">
              <FaShoppingCart className="inline-block" /> Cart
            </Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-primary">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
