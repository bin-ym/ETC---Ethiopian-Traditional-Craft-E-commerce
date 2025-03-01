import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    role: "user",
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    shopName: "",
  });

  useEffect(() => {
    fetchUsersAndArtisans();
  }, []);

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
      setError(err.response?.data?.error || "Failed to fetch users and artisans.");
      console.error("Error fetching users and artisans:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/${type === "user" ? "users" : "artisans"}/admin/${id}`, {
        withCredentials: true,
      });
      if (type === "user") {
        setUsers(users.filter((user) => user._id !== id));
      } else {
        setArtisans(artisans.filter((artisan) => artisan._id !== id));
      }
      console.log(`✅ ${type} Deleted:`, id);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to delete ${type}.`);
      console.error(`Error deleting ${type}:`, err.response?.data || err.message);
    }
  };

  const openModal = (user = null, type = "add") => {
    setShowModal(true);
    setModalError(null);
    if (type === "edit") {
      setEditMode(true);
      setEditUserId(user._id);
      setNewUser({
        role: user.shopName ? "artisan" : "user",
        name: user.name,
        email: user.email,
        password: "", // Leave password empty for editing
        phoneNumber: user.phoneNumber,
        shopName: user.shopName || "",
      });
    } else {
      setEditMode(false);
      setEditUserId(null);
      setNewUser({
        role: "user",
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        shopName: "",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError(null);
    setEditMode(false);
    setEditUserId(null);
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const { role, name, email, password, phoneNumber, shopName } = newUser;
    if (!name || !email || (!editMode && !password) || !phoneNumber || (role === "artisan" && !shopName)) {
      setModalError("Please fill in all required fields.");
      setModalLoading(false);
      return;
    }

    try {
      const endpoint = role === "user" ? "/api/users/admin" : "/api/artisans/admin";
      const payload = role === "user"
        ? { name, email, phoneNumber, ...(editMode && password ? { password } : {}) }
        : { name, email, shopName, phoneNumber, ...(editMode && password ? { password } : {}) };

      if (editMode) {
        // Update existing user
        const response = await axios.put(
          `http://localhost:5000${endpoint}/${editUserId}`,
          payload,
          { withCredentials: true }
        );
        if (role === "user") {
          setUsers(users.map((user) => (user._id === editUserId ? response.data : user)));
        } else {
          setArtisans(artisans.map((artisan) => (artisan._id === editUserId ? response.data : artisan)));
        }
        console.log(`✅ ${role} Updated:`, response.data);
      } else {
        // Add new user
        const response = await axios.post(`http://localhost:5000${endpoint}`, payload, {
          withCredentials: true,
        });
        if (role === "user") {
          setUsers([...users, response.data]);
        } else {
          setArtisans([...artisans, response.data]);
        }
        console.log(`✅ ${role} Added:`, response.data);
      }
      closeModal();
    } catch (err) {
      setModalError(err.response?.data?.error || `Failed to ${editMode ? "update" : "add"} ${role}.`);
      console.error(`Error ${editMode ? "updating" : "adding"} ${role}:`, err.response?.data || err.message);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Users</h1>
          <button
            onClick={() => openModal(null, "add")}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Add User
          </button>
        </div>
        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">Loading users and artisans...</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchUsersAndArtisans}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            {/* Users Section */}
            <h2 className="mt-6 mb-2 text-2xl font-semibold text-gray-800">Customers</h2>
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone Number</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.phoneNumber}</td>
                        <td className="flex px-4 py-2 space-x-2">
                          <button
                            onClick={() => openModal(user, "edit")}
                            className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id, "user")}
                            className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Artisans Section */}
            <h2 className="mt-6 mb-2 text-2xl font-semibold text-gray-800">Artisans</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Shop Name</th>
                    <th className="px-4 py-2 text-left">Phone Number</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artisans.length > 0 ? (
                    artisans.map((artisan) => (
                      <tr key={artisan._id}>
                        <td className="px-4 py-2">{artisan.name}</td>
                        <td className="px-4 py-2">{artisan.email}</td>
                        <td className="px-4 py-2">{artisan.shopName}</td>
                        <td className="px-4 py-2">{artisan.phoneNumber}</td>
                        <td className="flex px-4 py-2 space-x-2">
                          <button
                            onClick={() => openModal(artisan, "edit")}
                            className="px-4 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(artisan._id, "artisan")}
                            className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                        No artisans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-gray-800">{editMode ? "Edit User" : "Add New User"}</h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    disabled={editMode} // Prevent changing role when editing
                  >
                    <option value="user">Customer</option>
                    <option value="artisan">Artisan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">
                    {editMode ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required={!editMode} // Password is optional when editing
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                {newUser.role === "artisan" && (
                  <div>
                    <label className="block mb-1 text-sm font-semibold text-gray-700">Shop Name</label>
                    <input
                      type="text"
                      name="shopName"
                      value={newUser.shopName}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {modalLoading ? "Saving..." : editMode ? "Update User" : "Add User"}
                  </button>
                </div>
              </form>
              {modalError && <p className="mt-4 text-center text-red-500">{modalError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;