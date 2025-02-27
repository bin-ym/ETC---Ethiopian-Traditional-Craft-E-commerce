import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching from:", "http://localhost:5000/api/products"); // Debug
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) throw new Error(`Failed to fetch products. Status: ${response.status}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setError(error.message);
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
    if (!newProduct.name || !newProduct.price || !newProduct.description || !imageFile) {
      alert("Please fill in all fields and select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("description", newProduct.description);
    formData.append("image", imageFile);

    try {
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to add product. Status: ${response.status}`);
      const addedProduct = await response.json();
      setProducts([...products, addedProduct]);
      closeModal();
    } catch (error) {
      console.error("Error adding product:", error.message);
      alert("Failed to add product: " + error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Failed to delete product. Status: ${response.status}`);
      setProducts(products.filter((product) => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product: " + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct(product);
    setIsEditing(true);
    setEditId(product._id);
    setShowModal(true);
  };

  const handleUpdateProduct = async () => {
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("description", newProduct.description);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${editId}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to update product. Status: ${response.status}`);
      const updatedProduct = await response.json();
      setProducts(products.map((p) => (p._id === editId ? updatedProduct : p)));
      closeModal();
    } catch (error) {
      console.error("Error updating product:", error.message);
      alert("Failed to update product: " + error.message);
    }
  };

  const openModal = () => {
    setNewProduct({ name: "", price: "", description: "", image: "" });
    setImageFile(null);
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setNewProduct({ name: "", price: "", description: "", image: "" });
    setImageFile(null);
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
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
          <button
            onClick={fetchProducts}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
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
                  <td className="px-4 py-2">${product.price}</td>
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
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Product Name"
                className="w-full px-4 py-2 border rounded"
              />
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full px-4 py-2 border rounded"
              ></textarea>
              <input
                type="number"
                name="price"
                value={newProduct.price}
                onChange={handleInputChange}
                placeholder="Price"
                className="w-full px-4 py-2 border rounded"
              />
              <div>
                <label className="block mb-2 text-sm font-medium">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border rounded"
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
                >
                  {isEditing ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;