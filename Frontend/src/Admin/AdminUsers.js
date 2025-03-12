import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminUsers = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSessionAndFetchUsers();
  }, []);

  const checkSessionAndFetchUsers = async () => {
    try {
      const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
        withCredentials: true,
      });

      if (sessionResponse.data.role !== "admin") {
        setError(translateText("Please log in as an admin to access this page.", language));
        navigate("/login");
        return;
      }

      fetchUsersAndArtisans();
    } catch (err) {
      setError(translateText("Please log in as an admin to access this page.", language));
      navigate("/login");
    }
  };

  const fetchUsersAndArtisans = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersResponse = await axios.get("http://localhost:5000/api/users/admin", {
        withCredentials: true,
      });
      const artisansResponse = await axios.get("http://localhost:5000/api/artisans/admin", {
        withCredentials: true,
      });
      setUsers(usersResponse.data);
      setArtisans(artisansResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch users and artisans. Please ensure you are logged in as an admin.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, type, currentStatus) => {
    const actionText = currentStatus ? translateText("inactive", language) : translateText("active", language);
    if (!window.confirm(translateText(`Are you sure you want to mark this ${type} as ${actionText}?`, language))) return;

    try {
      const endpoint = type === "user" ? "users" : "artisans";
      const response = await axios.put(
        `http://localhost:5000/api/${endpoint}/admin/toggle/${id}`,
        {},
        { withCredentials: true }
      );

      if (type === "user") {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
      } else {
        setArtisans(artisans.map((artisan) => (artisan._id === id ? response.data : artisan)));
      }
    } catch (err) {
      setError(err.response?.data?.error || translateText(`Failed to toggle ${type} status.`, language));
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-wide text-indigo-600 animate-fade-in-down">
              {translateText("Admin Users", language)}
            </h1>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <svg
                className="w-6 h-6 text-indigo-600 animate-spin"
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
              <p className="ml-2 text-gray-600">{translateText("Loading users and artisans...", language)}</p>
            </div>
          )}
          {error && (
            <div className="py-6 text-center">
              <p className="mb-4 font-medium text-red-500">{error}</p>
              <button
                onClick={checkSessionAndFetchUsers}
                className="px-6 py-2 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
              >
                {translateText("Retry", language)}
              </button>
            </div>
          )}
          {!loading && !error && (
            <>
              <h2 className="mt-6 mb-4 text-2xl font-semibold tracking-wide text-indigo-600">
                {translateText("Customers", language)}
              </h2>
              <div className="mb-8 overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Name", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Email", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Phone Number", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Status", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Actions", language)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className="transition-colors duration-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800">{user.name}</td>
                          <td className="px-6 py-4 text-gray-800">{user.email}</td>
                          <td className="px-6 py-4 text-gray-800">{user.phoneNumber}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-sm rounded-full ${
                                user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.isActive ? translateText("Active", language) : translateText("Inactive", language)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(user._id, "user", user.isActive)}
                              className={`px-4 py-2 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                user.isActive
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              {user.isActive ? translateText("Deactivate", language) : translateText("Activate", language)}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          {translateText("No customers found.", language)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <h2 className="mt-6 mb-4 text-2xl font-semibold tracking-wide text-indigo-600">
                {translateText("Artisans", language)}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Name", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Email", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Shop Name", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Phone Number", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Status", language)}</th>
                      <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Actions", language)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisans.length > 0 ? (
                      artisans.map((artisan) => (
                        <tr key={artisan._id} className="transition-colors duration-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800">{artisan.name}</td>
                          <td className="px-6 py-4 text-gray-800">{artisan.email}</td>
                          <td className="px-6 py-4 text-gray-800">{artisan.shopName}</td>
                          <td className="px-6 py-4 text-gray-800">{artisan.phoneNumber}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 text-sm rounded-full ${
                                artisan.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {artisan.isActive ? translateText("Active", language) : translateText("Inactive", language)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(artisan._id, "artisan", artisan.isActive)}
                              className={`px-4 py-2 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                                artisan.isActive
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                            >
                              {artisan.isActive ? translateText("Deactivate", language) : translateText("Activate", language)}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          {translateText("No artisans found.", language)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;