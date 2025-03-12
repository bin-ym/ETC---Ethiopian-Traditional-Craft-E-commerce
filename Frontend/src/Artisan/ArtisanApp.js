import React from "react";
import { Routes, Route } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext"; // Adjust path if needed
import { translateText } from "../utils/translate";
import ProductManagement from "./ProductManagement";
import OrderManagement from "./OrderManagement";
// import NavbarArtisan from "./NavbarArtisan";
import ArtisanProfile from "./ArtisanProfile";
import ArtisanDashboard from "./ArtisanDashboard";
import ArtisanComments from "./ArtisanComments";

const ArtisanApp = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800">
      {/* <NavbarArtisan /> */}
      <Routes>
        <Route path="/" element={<ArtisanDashboard />} />
        <Route path="dashboard" element={<ArtisanDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="comments" element={<ArtisanComments />} />
        <Route path="profile" element={<ArtisanProfile />} />
        <Route
          path="*"
          element={
            <h1 className="mt-10 text-center text-white">
              {translateText("404: Admin Page Not Found", language)} {/* Adjusted key to match translate.js */}
            </h1>
          }
        />
      </Routes>
    </div>
  );
};

export default ArtisanApp;