import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const AdminProducts = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products/admin", {
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch products.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm(translateText("Are you sure you want to delete this product?", language))) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/admin/${id}`, {
        withCredentials: true,
      });
      setProducts(products.filter((product) => product._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to delete product.", language));
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{translateText("Admin Products", language)}</h1>
        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">{translateText("Loading products...", language)}</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {translateText("Retry", language)}
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">{translateText("Image", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Product Name", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Category", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Price", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Stock", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Artisan", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Actions", language)}</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td className="px-4 py-2">
                        <img
                          src={product.image ? `http://localhost:5000${product.image}` : "https://placehold.co/150x150"}
                          alt={product.name}
                          className="object-cover w-16 h-16 rounded"
                        />
                      </td>
                      <td className="px-4 py-2">{product.name}</td>
                      <td className="px-4 py-2">{product.category}</td>
                      <td className="px-4 py-2">{product.price.toFixed(2)} Br</td>
                      <td className="px-4 py-2">{product.stock}</td>
                      <td className="px-4 py-2">{product.artisanId?.name || translateText("Unknown Artisan", language)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          {translateText("Delete", language)}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      {translateText("No products found.", language)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;