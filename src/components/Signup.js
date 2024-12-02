import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();

    const handleSignup = () => {
        // Add signup logic here
        navigate("/login"); // Redirect to login page after successful signup
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800">
            <div className="bg-white text-gray-800 rounded-lg shadow-lg w-[400px] max-w-lg p-8">
                <h2 className="mb-6 text-4xl font-bold text-center">Sign Up</h2>
                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border border-gray-300 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-4 border border-gray-300 rounded"
                />
                <button
                    onClick={handleSignup}
                    className="w-full px-6 py-2 text-lg font-semibold text-gray-800 transition duration-300 bg-yellow-500 rounded-lg hover:bg-yellow-400"
                >
                    Sign Up
                </button>
                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
