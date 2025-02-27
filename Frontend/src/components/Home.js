import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800 text-white">
            <h1 className="text-5xl font-extrabold text-center mb-6">
                Welcome to Ethiopian Traditional Craft E-commerce
            </h1>
            <p className="text-xl mb-6 text-center max-w-2xl px-4">
                Discover unique, handcrafted Ethiopian products and bring the beauty of Ethiopian culture into your home.
            </p>
            <Link to="/products" className="bg-yellow-500 text-gray-800 font-semibold py-2 px-6 rounded-lg text-xl hover:bg-yellow-400 transition duration-300">
                Explore Products
            </Link>
        </div>
    );
};

export default Home;
