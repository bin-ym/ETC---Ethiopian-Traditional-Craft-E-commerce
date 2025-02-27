import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminPanel = () => {
  return (
    <div>
      <header>Admin Panel Header</header>
      <Outlet />
    </div>
  );
};

export default AdminPanel;
