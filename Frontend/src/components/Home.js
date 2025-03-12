import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext"; // Correct path
import { translateText } from "../utils/translate"; // Correct path

const Home = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-r from-green-600 to-yellow-400">
      <h1 className="mb-6 text-6xl font-extrabold text-center drop-shadow-lg">
        {translateText("Welcome to Ethiopian Traditional Craft E-commerce", language)}
      </h1>
      <p className="max-w-2xl p-4 px-4 mb-6 text-xl text-center bg-white rounded-lg shadow-lg bg-opacity-30">
        {translateText(
          "Discover unique, handcrafted Ethiopian products and bring the beauty of Ethiopian culture into your home.",
          language
        )}
      </p>
      <Link
        to="/products"
        className="px-8 py-3 text-2xl font-semibold text-white transition duration-300 transform bg-red-500 rounded-full shadow-lg hover:bg-red-400 hover:scale-105"
      >
        {translateText("Explore Products", language)}
      </Link>
    </div>
  );
};

export default Home;