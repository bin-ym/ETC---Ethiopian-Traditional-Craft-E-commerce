import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AddProduct = () => {
  const { language } = useLanguage();
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: 0,
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "Woven Textiles",
    "Pottery",
    "Jewellery",
    "Baskets",
    "Wood Carvings",
    "Other Ethiopian Traditional Crafts",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setProductData({ ...productData, [name]: value >= 0 ? value : "" });
    } else {
      setProductData({ ...productData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(translateText("Please upload a valid image (JPEG, PNG, or GIF).", language));
        setProductData({ ...productData, image: null });
      } else {
        setError(null);
        setProductData({ ...productData, image: file });
      }
    }
  };

  const insertProduct = async () => {
    setLoading(true);
    setError(null);

    const { name, price, description, category, stock, image } = productData;
    if (!name || !price || !description || !category || !image || stock === undefined) {
      setError(translateText("All fields are required.", language));
      setLoading(false);
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      setError(translateText("Price must be a positive number.", language));
      setLoading(false);
      return;
    }

    if (stock < 0) {
      setError(translateText("Stock cannot be negative.", language));
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("stock", stock);
      formData.append("image", image);

      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setError(translateText("Session expired. Please log in again.", language));
          navigate("/login");
          return;
        }
        throw new Error(errorData.error || translateText("Failed to insert product", language));
      }

      const result = await response.json();
      console.log("Product inserted successfully:", result);
      alert(translateText("Product added successfully!", language));
      setProductData({ name: "", price: "", description: "", category: "", stock: 0, image: null });
      document.getElementById("image").value = null;
    } catch (error) {
      console.error("Error inserting product:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">
          {translateText("Add New Product", language)}
        </h2>
        <form>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Name", language)}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Price (in Br)", language)}
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Description", language)}
            </label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Category", language)}
            </label>
            <select
              id="category"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">{translateText("Select a category", language)}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {/* Categories are in English, no translation needed */}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="stock" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Stock", language)}
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={productData.stock}
              onChange={handleChange}
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="image" className="block mb-1 text-sm font-semibold text-gray-700">
              {translateText("Image", language)}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="button"
            onClick={insertProduct}
            disabled={loading}
            className="flex items-center justify-center w-full px-4 py-3 space-x-2 font-semibold text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 text-white animate-spin"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{translateText("Adding Product...", language)}</span>
              </>
            ) : (
              <span>{translateText("Add Product", language)}</span>
            )}
          </button>
          {error && (
            <div className="flex items-center justify-between p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProduct;