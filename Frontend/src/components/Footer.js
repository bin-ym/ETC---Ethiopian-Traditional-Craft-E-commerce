import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className="py-8 mt-auto text-white bg-gray-800 border-t border-gray-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <p className="mb-4 text-sm md:mb-0">
            © {new Date().getFullYear()} {translateText("Ethiopian Traditional Crafts", language)}. {translateText("All rights reserved.", language)}
          </p>
          <div className="flex space-x-6">
            <a href="/about" className="text-sm transition duration-300 hover:text-yellow-400">
              {translateText("About Us", language)}
            </a>
            <a href="/contact" className="text-sm transition duration-300 hover:text-yellow-400">
              {translateText("Contact", language)}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;