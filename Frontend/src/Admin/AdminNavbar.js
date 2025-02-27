import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Toggle the dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Handle logout and redirect to the main page
  const handleLogout = () => {
    // Clear session/local storage or any authentication state here if needed
    navigate('/');
  };

  // Handle profile redirection
  const handleProfile = () => {
    navigate('/admin/profile');
  };

  // Handle settings redirection
  const handleSettings = () => {
    navigate('/admin/settings');
  };

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="py-4 bg-green-700 shadow-lg">
      <div className="container flex items-center justify-between px-6 mx-auto">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link
                to="/admin/dashboard"
                className="text-white hover:text-yellow-300"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="text-white hover:text-yellow-300"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="text-white hover:text-yellow-300"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="text-white hover:text-yellow-300"
              >
                Users
              </Link>
            </li>
          </ul>
        </nav>

        {/* Avatar Section */}
        <div className="relative" ref={dropdownRef}>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={toggleDropdown}  // Toggle dropdown on avatar click
          />
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 w-48 mt-2 text-black bg-white rounded-md shadow-lg">
              <ul>
                <li>
                  <button
                    onClick={handleSettings}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
                  >
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleProfile}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;