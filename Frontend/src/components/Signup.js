import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const Signup = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    shopName: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (!password) {
      setPasswordStrength("");
      return;
    }

    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /\d/.test(password);
    const special = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    const criteriaMet = [length, uppercase, lowercase, number, special].filter(Boolean).length;

    if (criteriaMet === 5) setPasswordStrength(translateText("Strong ✅", language));
    else if (criteriaMet >= 3) setPasswordStrength(translateText("Medium ⚠️", language));
    else setPasswordStrength(translateText("Weak ❌", language));

    setPasswordError(criteriaMet === 5 ? "" : translateText("Password must meet all security requirements.", language));
  };

  const validatePhoneNumber = (phoneNumber) => {
    return /^\d{10}$/.test(phoneNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "password") {
      validatePassword(value);
    }

    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setPhoneError(validatePhoneNumber(numericValue) ? "" : translateText("Phone number must be exactly 10 digits.", language));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPhoneError("");

    const { name, email, password, phoneNumber, shopName, role } = formData;

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError(translateText("Phone number must be exactly 10 digits.", language));
      setLoading(false);
      return;
    }

    if (passwordStrength === translateText("Weak ❌", language)) {
      setError(translateText("Your password is too weak. Please use a stronger password.", language));
      setLoading(false);
      return;
    }

    const payload = role === "artisan" ? { name, email, password, shopName, phoneNumber } : { name, email, password, phoneNumber };

    try {
      const endpoint = role === "artisan" ? "/api/artisans/register" : "/api/users/register";
      const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (response.status === 201) {
        alert(translateText("Signup successful! Please log in.", language));
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || translateText("Signup failed. Please try again.", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-4xl font-extrabold text-center text-indigo-600">
          {translateText("Create Your Account 🌟", language)}
        </h2>

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("I am a:", language)}</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="user">{translateText("Customer", language)}</option>
              <option value="artisan">{translateText("Artisan", language)}</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Full Name", language)}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Email Address", language)}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Password", language)}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            {passwordStrength && (
              <p className={`text-sm mt-1 ${passwordStrength.includes("Weak") ? "text-red-500" : passwordStrength.includes("Medium") ? "text-yellow-500" : "text-green-500"}`}>
                {translateText("Password Strength:", language)} {passwordStrength}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Phone Number", language)}</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
          </div>

          {formData.role === "artisan" && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Shop Name", language)}</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="w-full p-3 transition duration-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold text-white transition duration-200 bg-indigo-600 rounded-md hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50"
          >
            {loading ? translateText("Signing Up...", language) : translateText("Sign Up", language)}
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
          {translateText("Already have an account?", language)}{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            {translateText("Login", language)}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;