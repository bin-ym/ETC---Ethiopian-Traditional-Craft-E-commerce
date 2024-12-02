import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", details: "", imageUrls: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const storedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(storedProducts);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((urls) => {
      setNewProduct((prev) => ({ ...prev, imageUrls: urls }));
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.details || newProduct.imageUrls.length === 0) {
      alert("Please fill in all fields and upload at least one image.");
      return;
    }

    const priceValue = parseFloat(newProduct.price);
    if (isNaN(priceValue)) {
      alert("Price must be a valid number.");
      return;
    }

    const newProductData = {
      id: Date.now(),
      name: newProduct.name,
      price: priceValue,
      details: newProduct.details,
      imageUrls: newProduct.imageUrls,
    };

    const updatedProducts = [...products, newProductData];
    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    closeModal();
  };

  const handleDeleteProduct = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (confirmed) {
      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem("products", JSON.stringify(updatedProducts));
    }
  };

  const handleEditProduct = (id) => {
    const productToEdit = products.find((product) => product.id === id);
    setNewProduct({ ...productToEdit });
    setIsEditing(true);
    setEditId(id);
    setShowModal(true);
  };

  const handleUpdateProduct = () => {
    const priceValue = parseFloat(newProduct.price);
    if (isNaN(priceValue)) {
      alert("Price must be a valid number.");
      return;
    }

    const updatedProducts = products.map((product) =>
      product.id === editId
        ? { ...product, name: newProduct.name, price: priceValue, details: newProduct.details, imageUrls: newProduct.imageUrls }
        : product
    );

    setProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    closeModal();
  };

  const openModal = () => {
    setNewProduct({ name: "", price: "", details: "", imageUrls: [] });
    setIsEditing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setNewProduct({ name: "", price: "", details: "", imageUrls: [] });
    setIsEditing(false);
    setEditId(null);
    setShowModal(false);
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
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

      <div className="p-6 bg-white rounded shadow-md">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Images</th>
              <th className="px-4 py-2 text-left">Product Name</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-2">
                  {Array.isArray(product.imageUrls) && product.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={product.name}
                      className="object-cover w-16 h-16 mr-2 cursor-pointer"
                      onClick={() => handleImageClick(url)}
                    />
                  ))}
                </td>
                <td className="px-4 py-2">{product.name}</td>
                <td className="px-4 py-2">{product.details}</td>
                <td className="px-4 py-2">{product.price}</td>
                <td className="flex items-center px-4 py-2 space-x-4">
                  <button
                    onClick={() => handleEditProduct(product.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg p-6 bg-white rounded shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Details</label>
                <textarea
                  name="details"
                  value={newProduct.details}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                ></textarea>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative p-4">
            <img src={selectedImage} alt="Selected" className="max-w-full max-h-screen" />
            <button
              onClick={closeImageModal}
              className="absolute px-2 text-white bg-red-600 rounded top-2 right-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;