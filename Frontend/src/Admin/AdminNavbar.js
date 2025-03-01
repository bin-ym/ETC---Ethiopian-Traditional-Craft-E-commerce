import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/logout", {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
      navigate('/login');
    }
  };

  return (
    <header className="py-4 bg-blue-600 shadow-lg">
      <div className="container flex items-center justify-between px-6 mx-auto">
        <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/admin/dashboard" className="text-white hover:text-blue-200">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/products" className="text-white hover:text-blue-200">
                Products
              </Link>
            </li>
            <li>
              <Link to="/admin/orders" className="text-white hover:text-blue-200">
                Orders
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="text-white hover:text-blue-200">
                Users
              </Link>
            </li>
            <li>
              <Link to="/admin/comments" className="text-white hover:text-blue-200">
                View Comments
              </Link>
            </li>
            <li>
              <Link to="/admin/profile" className="text-white hover:text-blue-200">
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default AdminNavbar;