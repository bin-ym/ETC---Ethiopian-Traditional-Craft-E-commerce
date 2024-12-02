// SellerDashboard.js
import React from "react";
import { Link } from "react-router-dom";

const SellerDashboard = () => {
  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Seller Dashboard</h1>
      <div className="grid grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-2xl">20</p>
        </div>
        <div className="p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-2xl">15</p>
        </div>
        <div className="p-6 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold">Sales Today</h2>
          <p className="text-2xl">$300</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Quick Links</h2>
        <div className="grid grid-cols-2 gap-6">
          <Link to="/seller/products" className="p-4 text-white bg-blue-600 rounded hover:bg-blue-700">
            Manage Products
          </Link>
          <Link to="/seller/orders" className="p-4 text-white bg-green-600 rounded hover:bg-green-700">
            View Orders
          </Link>
          <Link to="/seller/profile" className="p-4 text-white bg-gray-600 rounded hover:bg-gray-700">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
