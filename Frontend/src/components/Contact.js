import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { name, email, message } = formData;
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (message.trim().length < 10) {
      return "Message must be at least 10 characters long.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Client-side validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Mock API call (replace with actual endpoint if available)
      await axios.post("http://localhost:5000/api/contact", formData);
      setSuccess("Thank you for reaching out! We will get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to send message. Please try again.";
      setError(errorMsg);
      console.error("❌ Contact Form Error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Contact Us</h1>
      <p className="text-lg text-gray-700 text-center mb-8">
        Have questions or feedback? We’d love to hear from you! Fill out the form below, and our team will get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <React.Fragment>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending...</span>
            </React.Fragment>
          ) : (
            <span>Send Message</span>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
            <p>{error}</p>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
            <p>{success}</p>
            <button onClick={() => setSuccess("")} className="text-green-700 hover:text-green-900">
              ✕
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Contact;