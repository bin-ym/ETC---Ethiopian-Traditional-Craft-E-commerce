import React from "react";
import { Routes, Route } from "react-router-dom";
import SellerDashboard from './SellerDashboard';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import Profile from './Profile'; // Updated to use the new Profile component
import Settings from './Settings'; // Import Settings page
import NavbarSeller from './NavbarSeller';

const SellerApp = () => {
  return (
    <div>
      <NavbarSeller />
      <Routes>
        <Route path="/" element={<SellerDashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/profile" element={<Profile />} /> {/* Updated profile route */}
        <Route path="/settings" element={<Settings />} /> {/* New settings route */}
        {/* Other seller-related routes */}
      </Routes>
    </div>
  );
};

export default SellerApp;
