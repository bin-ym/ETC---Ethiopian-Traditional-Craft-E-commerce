// SellerProfile.js
import React from "react";

const SellerProfile = () => {
  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Seller Profile</h1>
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="text-xl font-semibold">Name: John Doe</h2>
        <p className="text-sm">Email: johndoe@example.com</p>
        <p className="text-sm">Shop Name: John's Crafts</p>
        <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default SellerProfile;
