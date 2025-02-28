import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    shopName: "", // Only for artisans
    role: "user", // Default to user, can be "artisan"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { name, email, password, phoneNumber, shopName, role } = formData;
    const payload = role === "artisan" 
      ? { name, email, password, shopName, phoneNumber }
      : { name, email, password, phoneNumber };

    try {
      const endpoint = role === "artisan" ? "/api/artisans/register" : "/api/users/register";
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (response.status === 201) {
        console.log("✅ Signup Successful:", response.data);
        alert("Signup successful! Please log in.");
        navigate("/login"); // Redirect to login page
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Signup failed. Please try again.";
      setError(errorMsg);
      console.error("❌ Signup Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-800">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg w-[400px] max-w-lg p-8">
        <h2 className="mb-6 text-4xl font-bold text-center">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
            >
              <option value="user">Customer</option>
              <option value="artisan">Artisan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-sm font-semibold">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Enter your phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
          </div>
          {formData.role === "artisan" && (
            <div className="mb-4">
              <label className="block mb-1 text-sm font-semibold">Shop Name</label>
              <input
                type="text"
                name="shopName"
                placeholder="Enter your shop name"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-2 text-lg font-semibold text-gray-800 transition duration-300 bg-yellow-500 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        {error && (
          <p className="mt-4 text-center text-red-600">{error}</p>
        )}
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