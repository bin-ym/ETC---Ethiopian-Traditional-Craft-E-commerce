import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div className="sidebar bg-gray-800 text-white w-64 h-screen fixed">
            <div className="py-6 px-4">
                <h2 className="text-xl font-bold text-center mb-6">Ethiopian Crafts</h2>
                <ul className="space-y-4">
                    <li>
                        <Link to="/" className="block text-gray-300 hover:text-primary">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/cart" className="block text-gray-300 hover:text-primary">
                            Cart
                        </Link>
                    </li>
                    <li>
                        <Link to="/login" className="block text-gray-300 hover:text-primary">
                            Login
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
