import React, { useState } from "react";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold text-center">Settings</h1>
      <div className="max-w-lg p-6 mx-auto bg-white rounded-lg shadow-lg">
        {/* Notification Settings */}
        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Notifications</h2>
          <div className="flex items-center">
            <label className="mr-4 text-gray-700">Enable Notifications</label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={handleToggleNotifications}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">Theme</h2>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <button
          onClick={() => alert("Settings saved!")}
          className="w-full px-4 py-2 mt-6 text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;