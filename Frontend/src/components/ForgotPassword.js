import React from "react";

const ForgotPassword = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800 text-white">
            <h2 className="text-4xl font-bold mb-6">Forgot Password</h2>
            <p className="text-center mb-6">
                Enter your email, and we'll send you a link to reset your password.
            </p>
            <input
                type="email"
                placeholder="Email"
                className="p-3 mb-4 border border-gray-300 rounded bg-white text-gray-800 w-80"
            />
            <button className="bg-yellow-500 text-gray-800 font-semibold py-2 px-6 rounded-lg text-lg hover:bg-yellow-400 transition duration-300">
                Send Reset Link
            </button>
        </div>
    );
};

export default ForgotPassword;
