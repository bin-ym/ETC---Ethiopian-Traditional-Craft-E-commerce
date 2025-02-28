import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/users/profile", {
        withCredentials: true, // Send session cookie
      });
      console.log("Fetched Customer Profile:", response.data);
      setProfile({
        name: response.data.name || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile. Please log in.");
      console.error("Error fetching profile:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.patch(
        "http://localhost:5000/api/users/profile",
        profile,
        { withCredentials: true } // Send session cookie
      );
      console.log("✅ Updated Profile:", profile);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile. Please log in.");
      console.error("Error updating profile:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Customer Profile</h1>
      <div className="p-6 bg-white rounded shadow-md">
        {loading && (
          <p className="text-center text-gray-500 animate-pulse">Loading...</p>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
              Go to Login
            </Link>
          </div>
        )}
        {!loading && !error && (
          <>
            {!isEditing ? (
              <>
                <h2 className="text-xl font-semibold">Name: {profile.name}</h2>
                <p className="text-sm">Email: {profile.email}</p>
                <p className="text-sm">Phone Number: {profile.phoneNumber}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;