import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <h2 className="text-4xl font-bold text-red-500 mb-4">404</h2>
    <p className="text-lg text-gray-700 mb-8">Page Not Found</p>
    <Link to="/" className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700">
      Go Back Home
    </Link>
  </div>
);

export default NotFound;
