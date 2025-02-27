import React, { useState } from "react";

const initialUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  image: "https://via.placeholder.com/150",
};

const Profile = () => {
  const [profileImage, setProfileImage] = useState(initialUser.image);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...initialUser });

  const handleProfileImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = () => {
    console.log("Updated User:", editedUser);
    setIsEditing(false);
  };

  return (
    <div className="container px-4 py-12 mx-auto">
      <h1 className="mb-8 text-3xl font-bold text-center">User Profile</h1>
      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-32 h-32 mb-4 overflow-hidden transition-transform transform bg-gray-300 rounded-full cursor-pointer hover:scale-105"
            onClick={() => document.getElementById("profile-picture").click()}
          >
            <img
              src={profileImage}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </div>
          <input
            type="file"
            id="profile-picture"
            className="hidden"
            onChange={handleProfileImageChange}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{editedUser.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedUser.email}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800">{editedUser.email}</p>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 transition bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              className="px-4 py-2 text-white transition bg-green-600 rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 mt-6 text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;