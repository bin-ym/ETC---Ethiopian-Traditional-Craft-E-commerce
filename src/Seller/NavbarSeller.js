import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const NavbarSeller = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Handle logout and redirect to the main page
  const handleLogout = () => {
    // Clear session/local storage or any authentication state here if needed
    navigate('/'); // Redirect to the main page after logout
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="p-4 text-white bg-blue-600">
      <div className="container flex justify-between mx-auto">
        <Link to="/seller" className="text-xl font-semibold">
          Seller Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/seller/products" className="hover:underline">
            Products
          </Link>
          <Link to="/seller/orders" className="hover:underline">
            Orders
          </Link>

          {/* Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="transition-transform transform cursor-pointer hover:scale-110"
              onClick={toggleDropdown}
            >
              <div className="relative">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Avatar"
                  className="w-10 h-10 border-4 rounded-full shadow-lg border-gradient-to-r from-purple-400 to-blue-500"
                />
                <div className="absolute inset-0 transition-opacity duration-300 ease-in-out border-2 border-white rounded-full opacity-0 hover:opacity-100" />
              </div>
            </div>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 transition-opacity duration-300 ease-in-out bg-white rounded shadow-lg">
                <ul className="py-2 text-gray-700">
                  <li>
                    <Link
                      to="/seller/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/seller/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarSeller;