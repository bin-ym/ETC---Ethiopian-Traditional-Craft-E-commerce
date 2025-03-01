import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "", phoneNumber: "" });
  const [profileError, setProfileError] = useState(null); // Add for profile validation errors
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/admin/profile", {
        withCredentials: true,
      });
      setProfile(response.data);
      setProfileFormData({
        name: response.data.name,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber || "", // Handle case where phoneNumber might be missing
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch profile.");
      console.error("Error fetching profile:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
    setProfileError(null); // Clear error on input change
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/; // Only digits, exactly 10 characters
    if (!phoneRegex.test(phoneNumber)) {
      return "Phone number must be exactly 10 digits and contain only numbers.";
    }
    return null;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);

    // Validate phone number
    const phoneError = validatePhoneNumber(profileFormData.phoneNumber);
    if (phoneError) {
      setProfileError(phoneError);
      return;
    }

    try {
      const response = await axios.patch("http://localhost:5000/api/admin/profile", profileFormData, {
        withCredentials: true,
      });
      setProfile(response.data);
      setIsEditingProfile(false);
      console.log("✅ Profile Updated:", response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
      console.error("Error updating profile:", err.response?.data || err.message);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      await axios.patch("http://localhost:5000/api/admin/settings", passwordData, {
        withCredentials: true,
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsEditingProfile(false); // Exit edit mode after successful password update
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to update password.");
      console.error("Error updating password:", err.response?.data || err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">Admin Profile & Settings</h1>
        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">Loading profile...</p>
          </div>
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
          </div>
        )}
        {profile && !loading && !error && (
          <div className="space-y-8">
            {/* Profile Section */}
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">Profile Information</h2>
              {!isEditingProfile ? (
                <div className="space-y-2">
                  <p className="text-lg text-gray-700"><strong>Name:</strong> {profile.name}</p>
                  <p className="text-lg text-gray-700"><strong>Email:</strong> {profile.email}</p>
                  <p className="text-lg text-gray-700"><strong>Phone Number:</strong> {profile.phoneNumber || "Not set"}</p>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Profile Edit Form */}
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileFormData.name}
                        onChange={handleProfileChange}
                        className="w-full p-3 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileFormData.email}
                        onChange={handleProfileChange}
                        className="w-full p-3 border border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={profileFormData.phoneNumber}
                        onChange={handleProfileChange}
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                    </div>
                    {profileError && <p className="text-center text-red-500">{profileError}</p>}
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  {/* Password Section - Only shown in edit mode */}
                  <div>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {passwordLoading ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                    {passwordError && <p className="mt-4 text-center text-red-500">{passwordError}</p>}
                    {passwordSuccess && <p className="mt-4 text-center text-green-500">{passwordSuccess}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;