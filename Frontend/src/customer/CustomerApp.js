import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerDashboard from "./CustomerDashboard";
import CustomerOrders from "./CustomerOrders";
import CustomerProfile from "./CustomerProfile";
import CustomerComments from "./CustomerComments";
import CustomerOrderDetails from "./CustomerOrderDetails";
import CustomerCommentDetails from "./CustomerCommentDetails";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const CustomerApp = () => {
  const { language } = useLanguage(); // Added hook

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/orders/:orderId" element={<CustomerOrderDetails />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/comments" element={<CustomerComments />} />
        <Route path="comments/:commentId" element={<CustomerCommentDetails />} />
        <Route path="*" element={<h1 className="mt-10 text-center text-gray-800">{translateText("404: Page Not Found", language)}</h1>} />
      </Routes>
    </div>
  );
};

export default CustomerApp;