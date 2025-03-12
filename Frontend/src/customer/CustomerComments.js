import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const API_ENDPOINTS = {
  SESSION_ROLE: `${API_BASE_URL}/session/role`,
  COMMENTS_CUSTOMER: `${API_BASE_URL}/comments/customer`,
  PRODUCTS_CUSTOMER: `${API_BASE_URL}/products/customer`,
};

const CustomerComments = () => {
  const { language } = useLanguage(); // Added hook
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [newComment, setNewComment] = useState({ productId: "", text: "" });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingIds, setDeletingIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("CustomerComments: Component mounted");
    checkSessionAndFetchData();
  }, []);

  const checkSessionAndFetchData = async () => {
    console.log("Checking session...");
    try {
      const sessionResponse = await axios.get(API_ENDPOINTS.SESSION_ROLE, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log("Session Response:", sessionResponse.data);
      if (sessionResponse.data.role !== "user") {
        console.error("User is not authenticated as a customer:", sessionResponse.data.role);
        setError(translateText("Please log in as a customer to view your comments.", language));
        navigate("/login");
        return;
      }
      fetchComments();
      fetchProducts();
    } catch (err) {
      console.error("Session check failed:", err.response?.data || err.message);
      setError(translateText("Please log in to view your comments.", language));
      navigate("/login");
    }
  };

  const fetchComments = async () => {
    if (loading) return;
    console.log("Fetching comments...");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.COMMENTS_CUSTOMER, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log("Successfully fetched comments:", response.data);
      setComments(response.data);
      if (response.data.length === 0) {
        console.log("No comments found for this user.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || translateText("Failed to fetch comments. Please ensure you are logged in.", language);
      console.error("Error fetching comments:", err.response?.status, err.response?.data || err.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("Loading set to false");
    }
  };

  const fetchProducts = async () => {
    if (productsLoading) return;
    console.log("Fetching products for comment form...");
    setProductsLoading(true);
    setProductsError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.PRODUCTS_CUSTOMER, {
        withCredentials: true,
        timeout: 10000,
      });
      console.log("Successfully fetched products:", response.data);
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err.response?.data || err.message);
      setProductsError(err.response?.data?.error || translateText("Failed to fetch products for commenting.", language));
    } finally {
      setProductsLoading(false);
    }
  };

  const handleNewCommentChange = (e) => {
    const { name, value } = e.target;
    console.log("📝 Form input changed:", { name, value });
    setNewComment((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("📝 New comment state:", updated);
      return updated;
    });
    setFormError(null);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    console.log("🚀 Starting handleAddComment");

    if (!newComment.productId) {
      console.log("⚠️ Validation failed: No product selected");
      setFormError(translateText("Please select a product.", language));
      return;
    }
    if (!newComment.text.trim()) {
      console.log("⚠️ Validation failed: No comment text");
      setFormError(translateText("Please enter a comment.", language));
      return;
    }

    const commentData = {
      productId: newComment.productId,
      text: newComment.text.trim(),
    };
    console.log("📤 Submitting comment:", commentData);
    setFormLoading(true);
    setFormError(null);

    try {
      const response = await axios.post(
        API_ENDPOINTS.COMMENTS_CUSTOMER,
        commentData,
        { withCredentials: true, timeout: 10000 }
      );
      console.log("✅ Comment added successfully:", response.data);

      const newCommentFromServer = {
        _id: response.data._id || response.data.id,
        text: response.data.text,
        productId: response.data.productId,
        userId: response.data.userId,
        createdAt: response.data.createdAt || new Date().toISOString(),
      };
      setComments((prev) => {
        const updatedComments = [newCommentFromServer, ...prev];
        console.log("✅ Updated comments list:", updatedComments);
        return updatedComments;
      });
      closeModal();
      fetchComments();
    } catch (err) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error || translateText("Failed to add comment. Please try again.", language);
      console.error("❌ Error adding comment:", {
        status,
        error: errorMessage,
        details: err.message,
        responseData: err.response?.data,
      });
      setFormError(errorMessage);
      if (status === 403 || status === 401) {
        console.log("⚠️ Auth issue detected, redirecting to login");
        setError(translateText("Authentication failed. Please log in again.", language));
        navigate("/login");
      }
    } finally {
      console.log("🏁 Completing handleAddComment");
      setFormLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm(translateText("Are you sure you want to delete this comment?", language))) return;

    console.log("Deleting comment:", id);
    setDeletingIds((prev) => [...prev, id]);
    try {
      await axios.delete(`${API_ENDPOINTS.COMMENTS_CUSTOMER}/${id}`, {
        withCredentials: true,
        timeout: 10000,
      });
      setComments(comments.filter((comment) => comment._id !== id));
      console.log("✅ Comment Deleted:", id);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to delete comment.", language));
      console.error("Error deleting comment:", err.response?.data || err.message);
    } finally {
      setDeletingIds((prev) => prev.filter((deletingId) => deletingId !== id));
    }
  };

  const openModal = () => {
    console.log("Opening modal for new comment");
    setNewComment({ productId: "", text: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setNewComment({ productId: "", text: "" });
    setShowModal(false);
    setFormError(null);
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-6 text-3xl font-bold tracking-wide text-indigo-600 animate-fade-in-down">
            {translateText("My Comments", language)}
          </h1>

          <button
            onClick={openModal}
            className="px-6 py-2 mb-6 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50 hover:shadow-lg hover:-translate-y-1"
            disabled={productsLoading || products.length === 0}
          >
            {translateText("Add New Comment", language)}
          </button>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <svg
                className="w-6 h-6 text-indigo-600 animate-spin"
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
              <p className="ml-2 text-gray-600">{translateText("Loading comments...", language)}</p>
            </div>
          )}
          {error && (
            <div className="py-6 text-center">
              <p className="mb-4 font-medium text-red-500">{error}</p>
              {!loading && (
                <>
                  <button
                    onClick={checkSessionAndFetchData}
                    className="px-6 py-2 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
                  >
                    {translateText("Retry", language)}
                  </button>
                  <Link to="/login" className="block mt-2 text-indigo-600 hover:underline">
                    {translateText("Go to Login", language)}
                  </Link>
                </>
              )}
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Comment", language)}</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Product", language)}</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Date", language)}</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">{translateText("Actions", language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <tr key={comment._id} className="transition-colors duration-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-800">{comment.text}</td>
                        <td className="px-6 py-4 text-gray-800">{comment.productId?.name || translateText("Product Deleted", language)}</td>
                        <td className="px-6 py-4 text-gray-800">{new Date(comment.createdAt).toLocaleDateString()}</td>
                        <td className="flex items-center px-6 py-4 space-x-4">
                          <Link
                            to={`/customer/comments/${comment._id}`}
                            className="px-4 py-2 text-white transition-all duration-300 transform bg-indigo-500 rounded-md shadow-md hover:bg-indigo-600 hover:shadow-lg hover:-translate-y-1"
                          >
                            {translateText("View Details", language)}
                          </Link>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-500 transition-all duration-200 transform hover:text-red-600 hover:scale-110 disabled:opacity-50"
                            disabled={deletingIds.includes(comment._id)}
                          >
                            {deletingIds.includes(comment._id) ? (
                              translateText("Deleting...", language)
                            ) : (
                              <FaTrash className="w-5 h-5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        {translateText("No comments found. Add one to get started!", language)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-indigo-600">{translateText("Add New Comment", language)}</h2>
                {productsLoading ? (
                  <p className="text-gray-600">{translateText("Loading products...", language)}</p>
                ) : productsError ? (
                  <p className="text-red-500">{productsError}</p>
                ) : products.length === 0 ? (
                  <p className="text-gray-600">{translateText("No products available to comment on. Purchase something first!", language)}</p>
                ) : (
                  <form className="space-y-4" onSubmit={handleAddComment}>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Select Product", language)}</label>
                      <select
                        name="productId"
                        value={newComment.productId}
                        onChange={handleNewCommentChange}
                        className="w-full px-4 py-2 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={products.length === 0 || formLoading}
                      >
                        <option value="">{translateText("Select a product", language)}</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">{translateText("Comment", language)}</label>
                      <textarea
                        name="text"
                        value={newComment.text}
                        onChange={handleNewCommentChange}
                        className="w-full px-4 py-2 transition duration-200 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                        placeholder={translateText("e.g., 'I need more of it'", language)}
                        disabled={formLoading}
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-2 text-gray-600 transition-all duration-200 bg-gray-200 rounded-md hover:bg-gray-300"
                        disabled={formLoading}
                      >
                        {translateText("Cancel", language)}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50 hover:shadow-lg hover:-translate-y-1"
                        disabled={formLoading || products.length === 0}
                      >
                        {formLoading ? translateText("Submitting...", language) : translateText("Add Comment", language)}
                      </button>
                    </div>
                  </form>
                )}
                {formError && <p className="mt-2 text-red-500">{formError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

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

export default CustomerComments;