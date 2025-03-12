import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Import LanguageContext
import { translateText } from "../utils/translate"; // Import translate utility

const ProductList = () => {
  const { language } = useLanguage(); // Get current language
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    "Woven Textiles",
    "Pottery",
    "Jewellery",
    "Baskets",
    "Wood Carvings",
    "Other Ethiopian Traditional Crafts",
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products/public");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || translateText("Failed to fetch products.", language);
      setError(`${errorMsg} (Status: ${err.response?.status || "Unknown"})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    filterProducts(value, minPrice, maxPrice, selectedCategory);
  };

  const handlePriceChange = (e, type) => {
    const value = Math.max(0, Number(e.target.value));
    if (type === "min") {
      setMinPrice(value <= maxPrice ? value : maxPrice);
    } else if (type === "max") {
      setMaxPrice(value >= minPrice ? value : minPrice);
    }
    filterProducts(searchTerm, type === "min" ? value : minPrice, type === "max" ? value : maxPrice, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    filterProducts(searchTerm, minPrice, maxPrice, value);
  };

  const filterProducts = (search, min, max, category) => {
    let filtered = products.filter((product) => {
      const nameMatches = product.name?.toLowerCase().includes(search) || false;
      const priceMatches = product.price >= min && product.price <= max;
      const categoryMatches = category ? product.category === category : true;
      return nameMatches && priceMatches && categoryMatches;
    });
    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice(0);
    setMaxPrice(10000);
    setSelectedCategory("");
    setFilteredProducts(products);
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="flex flex-col mx-auto space-y-6 max-w-7xl lg:flex-row lg:space-y-0 lg:space-x-6">
        {/* Filter Sidebar */}
        <div className="w-full p-6 bg-white rounded-lg shadow-md lg:w-1/4 lg:sticky lg:top-24">
          <h2 className="mb-6 text-2xl font-bold tracking-wide text-indigo-600 animate-fade-in-down">
            {translateText("Filters", language)}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {translateText("Search Product", language)}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={translateText("Search by name...", language)}
                className="w-full p-3 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {translateText("Price Range", language)}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(e, "min")}
                  placeholder={translateText("Min Price", language)}
                  min="0"
                  max={maxPrice}
                  className="w-1/2 p-3 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-gray-600">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(e, "max")}
                  placeholder={translateText("Max Price", language)}
                  min={minPrice}
                  max="10000"
                  className="w-1/2 p-3 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {translateText("Price Slider", language)}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                value={minPrice}
                onChange={(e) => handlePriceChange(e, "min")}
                className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="range"
                min="0"
                max="10000"
                value={maxPrice}
                onChange={(e) => handlePriceChange(e, "max")}
                className="w-full h-2 mt-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="mt-2 text-sm text-gray-600">{minPrice} Br - {maxPrice} Br</p>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                {translateText("Category", language)}
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full p-3 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{translateText("All Categories", language)}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {translateText(category, language)} {/* Translate categories if needed */}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={resetFilters}
              className="w-full py-3 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
            >
              {translateText("Reset Filters", language)}
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="w-full p-6 bg-white rounded-lg shadow-md lg:w-3/4">
          <h2 className="mb-6 text-3xl font-bold tracking-wide text-indigo-600 animate-fade-in-down">
            {translateText("Product List", language)}
          </h2>
          {loading && (
            <div className="flex items-center justify-center h-64">
              <svg
                className="w-8 h-8 text-indigo-600 animate-spin"
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
              <p className="ml-2 text-gray-600">{translateText("Loading products...", language)}</p>
            </div>
          )}
          {error && (
            <div className="p-6 text-center">
              <p className="mb-4 font-medium text-red-500">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
              >
                {translateText("Retry", language)}
              </button>
            </div>
          )}
          {!loading && !error && (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <li
                    key={product._id}
                    className="p-4 transition-all duration-300 transform border border-gray-200 rounded-lg shadow-md bg-gray-50 hover:shadow-lg hover:-translate-y-1"
                  >
                    <Link to={`/products/${product._id}`} className="block text-center">
                      <img
                        src={
                          product.image
                            ? `http://localhost:5000${product.image}`
                            : "https://via.placeholder.com/150"
                        }
                        alt={product.name || translateText("Product Image", language)}
                        className="object-cover w-full h-48 mx-auto mb-4 transition-transform duration-300 transform rounded-lg shadow-sm hover:scale-105"
                      />
                      <h3 className="text-lg font-bold text-gray-800">
                        {product.name || translateText("Unnamed Product", language)}
                      </h3>
                      <p className="font-semibold text-indigo-600">
                        {product.price?.toFixed(2) || translateText("Price unavailable", language)} Br
                      </p>
                    </Link>
                  </li>
                ))
              ) : (
                <p className="py-6 text-center text-gray-500">
                  {translateText("No products match your search.", language)}
                </p>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Custom Tailwind Animation Styles */}
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

export default ProductList;