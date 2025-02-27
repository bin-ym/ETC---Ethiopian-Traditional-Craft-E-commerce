import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Check credentials for Admin
        if (username === 'admin' && password === 'admin123') {
            navigate('/admin/dashboard'); // Redirect to Admin Dashboard
        } 
        // Check credentials for Seller
        else if (username === 'seller' && password === 'seller123') {
            navigate('/seller/'); // Redirect to Seller Dashboard
        } 
        // Invalid credentials
        else {
            alert('Invalid credentials!');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 mb-4 border border-gray-300 rounded"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-6 border border-gray-300 rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;