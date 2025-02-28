import React from "react";
import { Routes, Route } from "react-router-dom";
import ArtisanDashboard from './ArtisanDashboard';
import ProductManagement from './ProductManagement'; // Assuming this exists
import OrderManagement from './OrderManagement';   // Assuming this exists
import ArtisanProfile from './ArtisanProfile';     // Renamed from Profile

const ArtisanApp = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<ArtisanDashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/profile" element={<ArtisanProfile />} />
      </Routes>
    </div>
  );
};
export default ArtisanApp;