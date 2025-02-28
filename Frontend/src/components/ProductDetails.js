import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("Product ID is missing from URL.");
        console.log("📤 Fetching product with ID:", id);
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
          const errorMessage = `Failed to fetch product with ID ${id}. Status: ${response.status}`;
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || errorMessage);
        }
        const productData = await response.json();
        if (!productData) throw new Error("Product not found.");
        setProduct(productData);
      } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      alert("Sorry, this product is out of stock!");
      return;
    }
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image
        ? `http://localhost:5000${product.image}`
        : "https://via.placeholder.com/150",
      quantity: 1,
    };
    addToCart(cartItem);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-center">Product Details</h2>
      {loading && (
        <p className="text-center text-gray-500 animate-pulse">Loading...</p>
      )}
      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <Link
            to="/products"
            className="inline-block mt-2 text-indigo-600 hover:underline"
          >
            Back to Product List
          </Link>
        </div>
      )}
      {product && !loading && !error && (
        <div className="space-y-4">
          <img
            src={
              product.image
                ? `http://localhost:5000${product.image}`
                : "https://via.placeholder.com/150"
            }
            alt={product.name || "Product Image"}
            className="object-cover w-full h-64 rounded-lg shadow-sm"
          />
          <h3 className="text-xl font-bold text-center text-gray-800">
            {product.name || "Unnamed Product"}
          </h3>
          <p className="font-semibold text-center text-indigo-600">
            ${product.price?.toFixed(2) || "Price unavailable"}
          </p>
          <p className="text-center text-gray-700">
            {product.description || "No description available."}
          </p>
          {product.category && (
            <p className="text-sm text-center text-gray-500">
              Category: {product.category}
            </p>
          )}
          <p className="text-sm text-center text-gray-500">
            Stock: {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`px-6 py-2 text-white rounded ${
                product.stock > 0
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </button>
            <Link
              to="/products"
              className="inline-block px-6 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-100"
            >
              Back to Product List
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;