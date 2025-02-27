import React, { useState } from 'react';

// Example User Data
const usersData = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User' },
    { id: 3, name: 'Sam Wilson', email: 'sam.wilson@example.com', role: 'User' },
];

const AdminUsers = () => {
    const [users, setUsers] = useState(usersData); // Initial state with users data
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Modal state
    const [editUser, setEditUser] = useState(null); // User being edited

    // Function to handle editing a user
    const handleEditClick = (user) => {
        setEditUser(user);
        setIsEditModalOpen(true);
    };

    // Function to handle deleting a user
    const handleDeleteClick = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (confirmed) {
            setUsers(users.filter(user => user.id !== id)); // Remove user from list
        }
    };

    // Function to handle saving the changes
    const handleSaveChanges = () => {
        setUsers(users.map(user => user.id === editUser.id ? editUser : user));
        setIsEditModalOpen(false); // Close the modal after saving
    };

    // Function to handle input change in the edit modal
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditUser({ ...editUser, [name]: value });
    };

    return (
        <div className="min-h-screen text-black bg-gradient-to-r from-green-500 to-teal-600">
            <div className="container px-6 py-12 mx-auto">
                <h2 className="mb-6 text-3xl font-bold">Manage Users</h2>
                <table className="min-w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="flex px-4 py-2 space-x-4">
                                    <button 
                                        onClick={() => handleEditClick(user)} 
                                        className="text-blue-500 hover:text-blue-700" 
                                        aria-label={`Edit ${user.name}`}
                                    >
                                        <i className="fas fa-edit"> Edit</i>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(user.id)} 
                                        className="text-red-500 hover:text-red-700" 
                                        aria-label={`Delete ${user.name}`}
                                    >
                                        <i className="fas fa-trash-alt"> Delete</i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="w-1/3 p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="mb-4 text-2xl">Edit User</h3>
                        <div>
                            <label className="block mb-2 text-sm font-medium">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={editUser.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                                aria-label="User Name"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={editUser.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                                aria-label="User Email"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 text-sm font-medium">Role</label>
                            <select
                                name="role"
                                value={editUser.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-md"
                                aria-label="User Role"
                            >
                               <option value="Seller">Seller</option>
                               <option value="Buyer">Buyer</option>
                            </select>
                        </div>
                        <div className="flex justify-end mt-6 space-x-4">
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-600 hover:text-gray-800">
                                Cancel
                            </button>
                            <button onClick={handleSaveChanges} className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
