import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => (
  <div>
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:underline">
          Ethiopian Craft
        </Link>
        <div>
          <Link to="/login" className="mr-4 hover:underline">
            Login
          </Link>
          <Link to="/signup" className="hover:underline">
            Signup
          </Link>
        </div>
      </nav>
    </header>
    <main className="container mx-auto p-6">{children}</main>
    <footer className="bg-gray-800 text-white text-center p-4 mt-12">
      <p>&copy; 2024 Ethiopian Traditional Craft E-commerce</p>
    </footer>
  </div>
);

export default Layout;
