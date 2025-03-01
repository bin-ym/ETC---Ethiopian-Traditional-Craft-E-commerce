import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

const ProductManagement = () => {
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

  const categories = [
    "Bed and Bath",
    "Beverage",
    "Electronics and Home Appliance",
    "Food",
    "Home Care",
    "Personal Care",
    "Stationary",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/products", {
        withCredentials: true,
      });
      setProducts(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch products. Please log in.");
      console.error("Error fetching products:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category || (!isEditing && !imageFile)) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);
    formData.append("stock", newProduct.stock || 0);
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
      setError(error.response?.data?.error || "Failed to add product. Please log in.");
      console.error("Error adding product:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        withCredentials: true,
      });
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      setError(error.response?.data?.error || "Failed to delete product. Please log in.");
      console.error("Error deleting product:", error.response?.data || error.message);
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

  const handleUpdateProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);
    formData.append("stock", newProduct.stock || 0);
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
      setError(error.response?.data?.error || "Failed to update product. Please log in.");
      console.error("Error updating product:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewProduct({ name: "", price: "", description: "", category: "", stock: "" });
    setImageFile(null);
    setIsEditing(false);
    setShowModal(true);
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
      <h1 className="mb-4 text-3xl font-bold">Product Management</h1>

      <button
        onClick={openModal}
        className="px-6 py-2 mb-4 text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        Add New Product
      </button>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          Loading products...
        </p>
      )}
      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          {loading || (
            <>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Retry
              </button>
              <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
                Go to Login
              </Link>
            </>
          )}
        </div>
      )}
      {!loading && !error && (
        <div className="p-6 bg-white rounded shadow-md">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Product Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-4 py-2">
                    <img
                      src={product.image ? `http://localhost:5000${product.image}` : "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="object-cover w-16 h-16 mr-2 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.description}</td>
                  <td className="px-4 py-2">{product.price} Br</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="flex items-center px-4 py-2 space-x-4">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full px-4 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  className="w-full px-4 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Category</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder="Stock"
                  className="w-full px-4 py-2 border rounded"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border rounded"
                  required={!isEditing}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={isEditing ? handleUpdateProduct : handleAddProduct}
                  className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Processing..." : isEditing ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;