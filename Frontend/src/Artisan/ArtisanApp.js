import React from "react";
import { Routes, Route } from "react-router-dom";
import ArtisanDashboard from "./ArtisanDashboard";
import ProductManagement from "./ProductManagement"; // Assuming this exists
import OrderManagement from "./OrderManagement";   // Assuming this exists
import ArtisanProfile from "./ArtisanProfile";     // Renamed from Profile
import ArtisanComments from "./ArtisanComments";   // Add import for comments

const ArtisanApp = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<ArtisanDashboard />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/profile" element={<ArtisanProfile />} />
        <Route path="/comments" element={<ArtisanComments />} /> {/* Add comments route */}
        <Route path="*" element={<h1 className="mt-10 text-center text-gray-800">404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default ArtisanApp;