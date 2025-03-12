import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const Login = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginResponse = await axios.post(
        `http://localhost:5000/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (loginResponse.status === 200) {
        const { role: serverRole, id } = loginResponse.data;

        try {
          const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
            withCredentials: true,
          });
          const role = sessionResponse.data.role;

          if (!role) {
            throw new Error(translateText("Session verification failed: No role found.", language));
          }

          if (role === "artisan") {
            navigate("/artisan/");
          } else if (role === "user") {
            navigate("/customer/");
          } else if (role === "admin") {
            navigate("/admin/");
          } else {
            navigate("/");
          }
        } catch (sessionErr) {
          setError(translateText("Failed to verify session. Please try logging in again.", language));
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || translateText("Login failed. Please try again.", language);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-4xl font-extrabold text-center text-indigo-600">
          {translateText("Welcome Back 👋", language)}
        </h2>
        <p className="mb-8 text-center text-gray-600">
          {translateText("Sign in to access your personalized shopping experience", language)}
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {translateText("Email Address", language)}
            </label>
            <input
              type="email"
              placeholder={translateText("your.email@example.com", language)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {translateText("Password", language)}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold text-white transition duration-200 bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
          >
            {loading ? translateText("Logging in...", language) : translateText("Login", language)}
          </button>
        </form>

        {error && (
          <div className="flex items-center justify-between p-3 mt-4 text-red-700 bg-red-100 rounded-md">
            <p>{error}</p>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-gray-600">
          {translateText("Don't have an account?", language)}{" "}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            {translateText("Sign Up", language)}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;