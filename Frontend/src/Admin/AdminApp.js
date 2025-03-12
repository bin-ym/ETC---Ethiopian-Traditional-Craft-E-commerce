import React from "react";
import { Routes, Route } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminProfile from "./AdminProfile";
import AdminComments from "./AdminComments";
import AdminNavbar from "./AdminNavbar";

const AdminApp = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800">
      <AdminNavbar />
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route
          path="*"
          element={
            <h1 className="mt-10 text-center text-white">
              {translateText("404: Admin Page Not Found", language)}
            </h1>
          }
        />
      </Routes>
    </div>
  );
};

export default AdminApp;