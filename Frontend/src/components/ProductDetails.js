import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      alert("Sorry, this product is out of stock!");
      return;
    }
    if (quantity > product.stock) {
      alert(`Only ${product.stock} items left in stock!`);
      return;
    }
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image
        ? `http://localhost:5000${product.image}`
        : "https://via.placeholder.com/150",
      quantity: quantity,
    };
    addToCart(cartItem);
    alert(`${quantity} x ${product.name} added to cart!`);
    setQuantity(1);
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchProduct();
  };

  return (
    <div className="max-w-5xl p-6 mx-auto mt-16"> {/* Added mt-16 to push down */}
      {/* Back to Product List Button */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-block px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-100"
        >
          Back to Product List
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center">
          <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          <p className="ml-2 text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="space-y-2 text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={retryFetch}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Retry
          </button>
          <Link
            to="/products"
            className="block text-indigo-600 hover:underline"
          >
            Back to Product List
          </Link>
        </div>
      )}
      {product && !loading && !error && (
        <div className="flex flex-col space-x-0 md:flex-row md:space-x-6">
          {/* Image Section */}
          <div className="flex justify-center w-full md:w-1/2">
            <img
              src={
                product.image
                  ? `http://localhost:5000${product.image}`
                  : "https://via.placeholder.com/150"
              }
              alt={product.name || "Product Image"}
              className="object-contain w-3/4 h-64 rounded-lg"
            />
          </div>
          {/* Details Section */}
          <div className="w-full space-y-4 md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800">{product.name || "Unnamed Product"}</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {product.price?.toFixed(2) || "Price unavailable"} Br
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Category: <span className="font-medium">{product.category || "Uncategorized"}</span>
              </p>
              <p className="text-sm text-gray-600">
                Unit: <span className="font-medium">PCS</span>
              </p>
              <p className={`text-sm ${product.stock > 0 ? "text-gray-600" : "text-red-600"}`}>
                Stock:{" "}
                <span className="font-medium">
                  {product.stock > 0 ? `Only ${product.stock} left - Hurry and order yours!` : "Out of stock"}
                </span>
              </p>
              {product.stock > 0 && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-3 text-black font-semibold rounded-lg ${
                product.stock > 0
                  ? "bg-yellow-400 hover:bg-yellow-500"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;