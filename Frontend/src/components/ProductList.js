import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products/public");
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to fetch products.";
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
    const value = Number(e.target.value);
    if (type === "min") setMinPrice(Math.min(value, maxPrice));
    if (type === "max") setMaxPrice(Math.max(value, minPrice));
    filterProducts(searchTerm, type === "min" ? value : minPrice, type === "max" ? value : maxPrice, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    filterProducts(searchTerm, minPrice, maxPrice, value);
  };

  const filterProducts = (search, min, max, category) => {
    let filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(search) &&
        product.price >= min &&
        product.price <= max
    );
    if (category) filtered = filtered.filter((product) => product.category === category);
    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice(0);
    setMaxPrice(500);
    setSelectedCategory("");
    setFilteredProducts(products);
  };

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];

  return (
    <div className="flex p-6 space-x-6 bg-gray-100 rounded-lg shadow-md">
      {/* Filter Sidebar */}
      <div className="w-1/4 p-4 bg-white rounded-lg">
        <h2 className="mb-4 text-xl font-bold text-indigo-600">Filters</h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Search Product</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Price Range</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handlePriceChange(e, "min")}
              placeholder="Min Price"
              min="0"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-600">-</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handlePriceChange(e, "max")}
              placeholder="Max Price"
              min="0"
              className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Price Slider</label>
          <input
            type="range"
            min="0"
            max="500"
            value={minPrice}
            onChange={(e) => handlePriceChange(e, "min")}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <input
            type="range"
            min="0"
            max="500"
            value={maxPrice}
            onChange={(e) => handlePriceChange(e, "max")}
            className="w-full h-2 mt-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <p className="mt-2 text-sm text-gray-600">${minPrice} - ${maxPrice}</p>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Category</label>
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={resetFilters}
          className="w-full py-2 text-white transition duration-300 bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Reset Filters
        </button>
      </div>

      {/* Product List */}
      <div className="w-3/4 p-4 bg-white rounded-lg">
        <h2 className="mb-4 text-2xl font-bold text-indigo-600">Product List</h2>
        {loading && (
          <div className="flex items-center justify-center h-64">
            <svg className="w-8 h-8 text-indigo-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-2 text-gray-600">Loading products...</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 mt-2 text-white transition duration-300 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <li
                  key={product._id}
                  className="p-4 transition-transform transform rounded-lg shadow bg-gray-50 hover:scale-105 hover:shadow-lg"
                >
                  <Link to={`/products/${product._id}`} className="block text-center">
                    <img
                      src={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/150"}
                      alt={product.name || "Product Image"}
                      className="object-cover w-full h-48 mx-auto mb-4 rounded-lg"
                    />
                    <h3 className="text-lg font-bold text-gray-800">{product.name || "Unnamed Product"}</h3>
                    <p className="font-semibold text-indigo-600">${product.price?.toFixed(2) || "Price unavailable"}</p>
                  </Link>
                </li>
              ))
            ) : (
              <p className="text-center text-gray-500">No products match your search.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductList;