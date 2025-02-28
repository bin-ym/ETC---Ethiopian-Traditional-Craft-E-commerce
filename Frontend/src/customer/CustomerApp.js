import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerDashboard from "./CustomerDashboard"; // Add this import
import CustomerOrders from "./CustomerOrders";
import CustomerProfile from "./CustomerProfile";

const CustomerApp = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<CustomerDashboard />} />{" "}
        {/* Default customer page */}
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/profile" element={<CustomerProfile />} />
      </Routes>
    </div>
  );
};

export default CustomerApp;
