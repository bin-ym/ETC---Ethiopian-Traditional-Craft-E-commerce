import React, { useState } from "react";

const user = {
  name: "John Doe",
  email: "john.doe@example.com",
  image: "https://via.placeholder.com/150",
};

const Profile = () => {
  const [profileImage, setProfileImage] = useState(user.image);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

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

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold text-center">Profile</h1>
      <div className="max-w-lg p-6 mx-auto bg-white rounded-lg shadow-lg">
        {/* Profile Image Section */}
        <div className="relative flex flex-col items-center mb-6">
          <div
            className="w-32 h-32 mb-4 overflow-hidden bg-gray-300 rounded-full cursor-pointer"
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

        {/* Editable Profile Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700">Name</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedUser.name}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          ) : (
            <p>{user.name}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-700">Email</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={editedUser.email}
              onChange={handleEditChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end mt-4 space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;