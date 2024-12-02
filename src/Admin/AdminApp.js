import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import Profile from './Profile';
import Settings from './Settings';  // Import settings page
import AdminNavbar from './AdminNavbar'; // Import AdminNavbar

const AdminApp = () => {
  return (
    <div>
      <AdminNavbar /> {/* Admin Navbar */}
      <Routes>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="profile" element={<Profile />} />  {/* Profile route */}
        <Route path="settings" element={<Settings />} />  {/* Settings route */}
        <Route path="*" element={<h1>404: Admin Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default AdminApp;
