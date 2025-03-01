import React from "react";
import { Routes, Route } from "react-router-dom";
import CustomerDashboard from "./CustomerDashboard"; // Default customer page
import CustomerOrders from "./CustomerOrders";
import CustomerProfile from "./CustomerProfile";
import CustomerComments from "./CustomerComments"; // Add import for comments
import CustomerOrderDetails from "./CustomerOrderDetails"; // If implemented

const CustomerApp = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<CustomerDashboard />} /> {/* Default customer page */}
        <Route path="/orders" element={<CustomerOrders />} />
        <Route path="/orders/:id" element={<CustomerOrderDetails />} /> {/* If implemented */}
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/comments" element={<CustomerComments />} /> {/* Add comments route */}
        <Route path="*" element={<h1 className="mt-10 text-center text-gray-800">404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default CustomerApp;