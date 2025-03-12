import React from "react";
import { Helmet } from "react-helmet"; // Assuming react-helmet is installed

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Helmet>
        <title>About Us - Ethiopian Traditional Craft E-commerce</title>
        <meta
          name="description"
          content="Learn about Ethiopian Traditional Craft E-commerce, our mission to empower local artisans, and our vision to bring authentic Ethiopian crafts to the world."
        />
      </Helmet>

      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">About Us</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <p className="text-lg text-gray-700 leading-relaxed text-center">
          Welcome to <span className="font-semibold">ETC - Ethiopian Traditional Craft E-commerce</span>, where tradition meets modern convenience. Our mission is to connect talented artisans from Ethiopia with customers worldwide, bringing unique, handcrafted products to your doorstep.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🌍 Our Vision</h2>
        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-gray-700">
            We aim to <span className="font-medium">empower local artisans</span> by providing a platform where they can showcase their crafts, gain global exposure, and sell their handmade products. By promoting Ethiopian cultural heritage, we strive to create sustainable opportunities for artisans while preserving traditional craftsmanship.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📜 Our Story</h2>
        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-gray-700">
            ETC was born out of a passion for Ethiopian culture and craftsmanship. Our founders, inspired by the rich traditions of Ethiopia, wanted to create a bridge between artisans and global customers. Today, we work with dozens of artisans across Ethiopia, helping them share their creations with the world.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 Why Choose Us?</h2>
        <div className="bg-gray-50 rounded-lg p-5">
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Authentic Ethiopian traditional crafts sourced directly from artisans</li>
            <li>Support for local communities and sustainable practices</li>
            <li>Secure and reliable shopping experience with safe payment options</li>
            <li>Fast and dependable delivery to bring your purchases to you quickly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;