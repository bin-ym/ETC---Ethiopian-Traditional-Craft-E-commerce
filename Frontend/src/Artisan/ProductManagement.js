import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const ProductManagement = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    checkSessionAndFetchProducts();
  }, []);

  const checkSessionAndFetchProducts = async () => {
    try {
      const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
        withCredentials: true,
      });

      if (sessionResponse.data.role !== "artisan") {
        setError(translateText("Please log in as an artisan to access this page.", language));
        navigate("/login");
        return;
      }

      fetchProducts();
    } catch (err) {
      setError(translateText("Please log in as an artisan to access this page.", language));
      navigate("/login");
    }
  };

  const fetchProducts = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (error) {
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.warn(`⚠️ Session verification failed, retrying fetch (${retryCount + 1}/${maxRetries})...`);
        try {
          const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
            withCredentials: true,
          });

          if (sessionResponse.data.role !== "artisan") {
            setError(translateText("Session expired. Please log in again.", language));
            navigate("/login");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchProducts(retryCount + 1);
        } catch (sessionErr) {
          setError(translateText("Session verification failed. Please log in again.", language));
          navigate("/login");
          return;
        }
      }
      setError(error.response?.data?.error || translateText("Failed to fetch products.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock") {
      setNewProduct({ ...newProduct, [name]: value >= 0 ? value : "" });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(translateText("Please upload a valid image (JPEG, PNG, or GIF).", language));
        setImageFile(null);
      } else {
        setError(null);
        setImageFile(file);
      }
    }
  };

  const handleAddProduct = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    const { name, price, description, category, stock } = newProduct;
    if (!name || !price || !description || !category || stock === undefined || (!isEditing && !imageFile)) {
      setError(translateText("Please fill in all required fields.", language));
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      setError(translateText("Price must be a positive number.", language));
      return;
    }

    if (stock < 0) {
      setError(translateText("Stock cannot be negative.", language));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("stock", stock || 0);
    if (imageFile) formData.append("image", imageFile);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/products", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts([...products, response.data.product]);
      closeModal();
    } catch (error) {
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.warn(`⚠️ Session verification failed, retrying add (${retryCount + 1}/${maxRetries})...`);
        try {
          const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
            withCredentials: true,
          });

          if (sessionResponse.data.role !== "artisan") {
            setError(translateText("Session expired. Please log in again.", language));
            navigate("/login");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return handleAddProduct(retryCount + 1);
        } catch (sessionErr) {
          setError(translateText("Session verification failed. Please log in again.", language));
          navigate("/login");
          return;
        }
      }
      setError(error.response?.data?.error || translateText("Failed to add product. Please log in.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    if (!window.confirm(translateText("Are you sure you want to delete this product?", language))) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        withCredentials: true,
      });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.warn(`⚠️ Session verification failed, retrying delete (${retryCount + 1}/${maxRetries})...`);
        try {
          const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
            withCredentials: true,
          });

          if (sessionResponse.data.role !== "artisan") {
            setError(translateText("Session expired. Please log in again.", language));
            navigate("/login");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return handleDeleteProduct(id, retryCount + 1);
        } catch (sessionErr) {
          setError(translateText("Session verification failed. Please log in again.", language));
          navigate("/login");
          return;
        }
      }
      setError(error.response?.data?.error || translateText("Failed to delete product. Please log in.", language));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
    });
    setIsEditing(true);
    setEditId(product._id);
    setShowModal(true);
  };

  const handleUpdateProduct = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000;

    const { name, price, description, category, stock } = newProduct;
    if (!name || !price || !description || !category || stock === undefined) {
      setError(translateText("Please fill in all required fields.", language));
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      setError(translateText("Price must be a positive number.", language));
      return;
    }

    if (stock < 0) {
      setError(translateText("Stock cannot be negative.", language));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("stock", stock || 0);
    if (imageFile) formData.append("image", imageFile);

    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/api/products/${editId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProducts(products.map((p) => (p._id === editId ? response.data : p)));
      closeModal();
    } catch (error) {
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.warn(`⚠️ Session verification failed, retrying update (${retryCount + 1}/${maxRetries})...`);
        try {
          const sessionResponse = await axios.get("http://localhost:5000/api/session/role", {
            withCredentials: true,
          });

          if (sessionResponse.data.role !== "artisan") {
            setError(translateText("Session expired. Please log in again.", language));
            navigate("/login");
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return handleUpdateProduct(retryCount + 1);
        } catch (sessionErr) {
          setError(translateText("Session verification failed. Please log in again.", language));
          navigate("/login");
          return;
        }
      }
      setError(error.response?.data?.error || translateText("Failed to update product. Please log in.", language));
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewProduct({ name: "", price: "", description: "", category: "", stock: "" });
    setImageFile(null);
    setIsEditing(false);
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setNewProduct({ name: "", price: "", description: "", category: "", stock: "" });
    setImageFile(null);
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
    setError(null);
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        {translateText("Product Management", language)}
      </h1>

      <button
        onClick={openModal}
        className="px-6 py-3 mb-6 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
      >
        {translateText("Add New Product", language)}
      </button>

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
          <div className="flex items-center justify-between p-3 text-red-700 bg-red-100 rounded-lg">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
          {!loading && (
            <>
              <button
                onClick={checkSessionAndFetchProducts}
                className="px-4 py-2 mt-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
              >
                {translateText("Retry", language)}
              </button>
              <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
                {translateText("Go to Login", language)}
              </Link>
            </>
          )}
        </div>
      )}
      {!loading && !error && (
        <div className="p-6 bg-white rounded-lg shadow-lg">
          {products.length === 0 ? (
            <p className="text-center text-gray-500">{translateText("No products found.", language)}</p>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Image", language)}
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Product Name", language)}
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Description", language)}
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Price", language)}
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Stock", language)}
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-gray-600">
                    {translateText("Actions", language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/150"}
                        alt={product.name}
                        className="object-cover w-16 h-16 mr-2 rounded-lg cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-800">{product.name}</td>
                    <td className="px-4 py-3 text-gray-600">{product.description}</td>
                    <td className="px-4 py-3 text-gray-800">{product.price} Br</td>
                    <td className="px-4 py-3 text-gray-800">{product.stock}</td>
                    <td className="flex items-center px-4 py-3 space-x-4">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-blue-600 transition duration-200 hover:text-blue-800"
                        title={translateText("Edit Product", language)}
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 transition duration-200 hover:text-red-800"
                        title={translateText("Delete", language)}
                      >
                        <FaTrash size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              {isEditing ? translateText("Edit Product", language) : translateText("Add New Product", language)}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {translateText("Name", language)}
                </label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder={translateText("Product Name", language)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {translateText("Description", language)}
                </label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder={translateText("Description", language)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {translateText("Price (in Br)", language)}
                </label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder={translateText("Price", language)}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {translateText("Category", language)}
                </label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">{translateText("Select a category", language)}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} {/* Categories are in English */}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {translateText("Stock", language)}
                </label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder={translateText("Stock", language)}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {isEditing ? translateText("Image (optional)", language) : translateText("Image", language)}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!isEditing}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 transition duration-200 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  {translateText("Cancel", language)}
                </button>
                <button
                  type="button"
                  onClick={isEditing ? handleUpdateProduct : handleAddProduct}
                  className="flex items-center justify-center px-6 py-2 space-x-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
                  disabled={loading}
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
                      <span>{isEditing ? translateText("Updating Product...", language) : translateText("Adding Product...", language)}</span>
                    </>
                  ) : (
                    <span>{isEditing ? translateText("Update Product", language) : translateText("Add Product", language)}</span>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div className="flex items-center justify-between p-3 mt-4 text-red-700 bg-red-100 rounded-lg">
                <p>{error}</p>
                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;