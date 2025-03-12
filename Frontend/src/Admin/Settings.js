import React, { useState } from "react";
import axios from "axios";

const Settings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoadingPassword(true);
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      setLoadingPassword(false);
      return;
    }

    try {
      await axios.patch("http://localhost:5000/api/admin/settings", passwordData, {
        withCredentials: true,
      });
      setSuccess("Password updated successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password.");
      console.error("Error updating password:", err.response?.data || err.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleSystemBackup = async () => {
    setLoadingBackup(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("http://localhost:5000/api/admin/backup", {}, {
        withCredentials: true,
      });
      setSuccess(`System backup completed! File: ${response.data.backupFile}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create system backup.");
      console.error("Error creating backup:", err.response?.data || err.message);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setLoadingMaintenance(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("http://localhost:5000/api/admin/maintenance", {}, {
        withCredentials: true,
      });
      setSuccess(`Maintenance mode ${response.data.maintenance ? "enabled" : "disabled"}!`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to toggle maintenance mode.");
      console.error("Error toggling maintenance:", err.response?.data || err.message);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-800">Admin Settings</h1>

        {/* Password Update Section */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Update Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingPassword}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingPassword}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingPassword}
              />
            </div>
            <button
              type="submit"
              disabled={loadingPassword}
              className="w-full py-2 text-white transition duration-200 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>

        {/* System Backup Section */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">System Backup</h2>
          <p className="mb-4 text-gray-600">Create a backup of the entire system database.</p>
          <button
            onClick={handleSystemBackup}
            disabled={loadingBackup}
            className="w-full py-2 text-white transition duration-200 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loadingBackup ? "Backing Up..." : "Create Backup"}
          </button>
        </section>

        {/* Maintenance Mode Section */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Maintenance Mode</h2>
          <p className="mb-4 text-gray-600">Toggle maintenance mode to enable or disable site access for users.</p>
          <button
            onClick={handleToggleMaintenance}
            disabled={loadingMaintenance}
            className="w-full py-2 text-white transition duration-200 bg-yellow-600 rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {loadingMaintenance ? "Toggling..." : "Toggle Maintenance Mode"}
          </button>
        </section>

        {/* Feedback */}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        {success && <p className="mt-4 text-center text-green-500">{success}</p>}
      </div>
    </div>
  );
};

export default Settings;