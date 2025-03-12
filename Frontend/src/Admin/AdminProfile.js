import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminProfile = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "", phoneNumber: "" });
  const [profileError, setProfileError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState("");
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
        phoneNumber: response.data.phoneNumber || "",
      });
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch profile.", language));
    } finally {
      setLoading(false);
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber) ? null : translateText("Phone number must be exactly 10 digits and contain only numbers.", language);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setProfileFormData((prev) => ({ ...prev, [name]: numericValue }));
      const phoneValidationError = validatePhoneNumber(numericValue);
      setPhoneError(phoneValidationError || "");
    } else {
      setProfileFormData((prev) => ({ ...prev, [name]: value }));
    }
    setProfileError(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError(null);
    setPhoneError("");

    const phoneValidationError = validatePhoneNumber(profileFormData.phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.patch("http://localhost:5000/api/admin/profile", profileFormData, {
        withCredentials: true,
      });
      setProfile(response.data);
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(err.response?.data?.error || translateText("Failed to update profile.", language));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      if (!validatePassword(value)) {
        setNewPasswordError(translateText("Password must be at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*).", language));
      } else {
        setNewPasswordError("");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    setNewPasswordError("");

    if (!validatePassword(passwordData.newPassword)) {
      setNewPasswordError(translateText("Password must be at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., !@#$%^&*).", language));
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(translateText("New password and confirm password do not match.", language));
      setPasswordLoading(false);
      return;
    }

    try {
      await axios.patch("http://localhost:5000/api/admin/settings", passwordData, {
        withCredentials: true,
      });
      setPasswordSuccess(translateText("Password updated successfully!", language));
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setIsEditingProfile(false);
    } catch (err) {
      setPasswordError(err.response?.data?.error || translateText("Failed to update password.", language));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{translateText("Admin Profile & Settings", language)}</h1>
        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">{translateText("Loading profile...", language)}</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchProfile}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {translateText("Retry", language)}
            </button>
          </div>
        )}
        {profile && !loading && !error && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-800">{translateText("Profile Information", language)}</h2>
              {!isEditingProfile ? (
                <div className="space-y-2">
                  <p className="text-lg text-gray-700"><strong>{translateText("Name", language)}:</strong> {profile.name}</p>
                  <p className="text-lg text-gray-700"><strong>{translateText("Email", language)}:</strong> {profile.email}</p>
                  <p className="text-lg text-gray-700"><strong>{translateText("Phone Number", language)}:</strong> {profile.phoneNumber || translateText("Not set", language)}</p>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    {translateText("Edit Profile", language)}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("Name", language)}</label>
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
                      <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("Email", language)}</label>
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
                      <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("Phone Number", language)}</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileFormData.phoneNumber}
                        onChange={handleProfileChange}
                        pattern="[0-9]*"
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                      {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
                    </div>
                    {profileError && <p className="text-center text-red-500">{profileError}</p>}
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={loading || phoneError}
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {translateText("Save Changes", language)}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {translateText("Cancel", language)}
                      </button>
                    </div>
                  </form>

                  <div>
                    <h2 className="mb-2 text-2xl font-semibold text-gray-800">{translateText("Change Password", language)}</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("Current Password", language)}</label>
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
                        <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("New Password", language)}</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 border border-gray-300 rounded"
                          required
                        />
                        {newPasswordError && <p className="mt-1 text-sm text-red-500">{newPasswordError}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-semibold text-gray-700">{translateText("Confirm New Password", language)}</label>
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
                        disabled={passwordLoading || newPasswordError}
                        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {passwordLoading ? translateText("Updating...", language) : translateText("Update Password", language)}
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