import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

const CustomerComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState(null);
  const [products, setProducts] = useState([]);
  const [newComment, setNewComment] = useState({
    productId: "",
    text: "",
  });
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("CustomerComments: Component mounted");
    fetchComments();
    fetchProducts();
  }, []);

  const fetchComments = async () => {
    console.log("CustomerComments: Fetching comments...");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/comments/customer", {
        withCredentials: true,
      });
      console.log("CustomerComments: Successfully fetched comments:", response.data);
      setComments(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to fetch comments.";
      console.error("CustomerComments: Error fetching comments:", err.response?.data || err.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("CustomerComments: Loading set to false, rendering should proceed");
    }
  };

  const fetchProducts = async () => {
    console.log("CustomerComments: Fetching products for comment form...");
    try {
      const response = await axios.get("http://localhost:5000/api/products/customer", {
        withCredentials: true,
      });
      console.log("CustomerComments: Successfully fetched products:", response.data);
      setProducts(response.data);
      if (response.data.length > 0) {
        setNewComment((prev) => ({ ...prev, productId: response.data[0]._id }));
      }
    } catch (err) {
      console.error("CustomerComments: Error fetching products:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to fetch products for commenting.");
    }
  };

  const handleNewCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleAddComment = async () => {
    if (!newComment.productId || !newComment.text.trim()) {
      setFormError("Please select a product and enter a comment.");
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/comments/customer",
        newComment,
        { withCredentials: true }
      );
      setComments([response.data, ...comments]); // Add new comment to the top
      closeModal();
      console.log("✅ Comment Added:", response.data);
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to add comment.");
      console.error("Error adding comment:", err.response?.data || err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditComment = (comment) => {
    console.log("CustomerComments: Editing comment:", comment._id);
    setEditCommentId(comment._id);
    setEditText(comment.text);
    setEditError(null);
  };

  const handleCancelEdit = () => {
    console.log("CustomerComments: Canceling edit");
    setEditCommentId(null);
    setEditText("");
    setEditError(null);
  };

  const handleSaveEdit = async (commentId) => {
    console.log("CustomerComments: Saving edited comment:", commentId);
    if (!editText.trim()) {
      setEditError("Comment cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/comments/customer/${commentId}`,
        { text: editText },
        { withCredentials: true }
      );
      setComments(comments.map(comment => 
        comment._id === commentId ? { ...comment, text: response.data.text } : comment
      ));
      handleCancelEdit();
      console.log("✅ Comment Updated:", commentId);
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to update comment.");
      console.error("Error updating comment:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    console.log("CustomerComments: Deleting comment:", id);
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/api/comments/customer/${id}`, {
        withCredentials: true,
      });
      setComments(comments.filter((comment) => comment._id !== id));
      console.log("✅ Comment Deleted:", id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete comment.");
      console.error("Error deleting comment:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewComment({ productId: products[0]?._id || "", text: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setNewComment({ productId: products[0]?._id || "", text: "" });
    setShowModal(false);
    setFormError(null);
  };

  console.log("CustomerComments: Rendering with state - loading:", loading, "error:", error, "comments:", comments);

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">My Comments</h1>

        {/* Button to Open Form Modal */}
        <button
          onClick={openModal}
          className="px-6 py-2 mb-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          disabled={products.length === 0}
        >
          Add New Comment
        </button>

        {loading && (
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
            </svg>
            <p className="ml-2 text-gray-500">Loading comments...</p>
          </div>
        )}
        {error && (
          <div className="text-center">
            <p className="font-medium text-red-500">{error}</p>
            {loading || (
              <>
                <button
                  onClick={fetchComments}
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
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Comment</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr key={comment._id} className="border-b">
                      <td className="px-4 py-2">
                        {editCommentId === comment._id ? (
                          <div>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-2 border rounded"
                              rows="3"
                            />
                            {editError && <p className="text-sm text-red-500">{editError}</p>}
                          </div>
                        ) : (
                          comment.text
                        )}
                      </td>
                      <td className="px-4 py-2">{comment.productId?.name || "Product Deleted"}</td>
                      <td className="px-4 py-2">{new Date(comment.createdAt).toLocaleDateString()}</td>
                      <td className="flex items-center px-4 py-2 space-x-4">
                        {editCommentId === comment._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(comment._id)}
                              className="text-green-600 hover:text-green-800"
                              disabled={loading}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditComment(comment)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                      No comments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Form Modal to Add New Comment */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded shadow-lg">
              <h2 className="mb-4 text-xl font-semibold">Add New Comment</h2>
              <form className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Select Product</label>
                  <select
                    name="productId"
                    value={newComment.productId}
                    onChange={handleNewCommentChange}
                    className="w-full px-4 py-2 border rounded"
                    disabled={products.length === 0}
                  >
                    {products.length === 0 ? (
                      <option value="">No products available</option>
                    ) : (
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Comment</label>
                  <textarea
                    name="text"
                    value={newComment.text}
                    onChange={handleNewCommentChange}
                    className="w-full px-4 py-2 border rounded"
                    rows="3"
                    placeholder="Write your comment here..."
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
                    onClick={handleAddComment}
                    className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    disabled={formLoading || products.length === 0}
                  >
                    {formLoading ? "Submitting..." : "Add Comment"}
                  </button>
                </div>
              </form>
              {formError && <p className="mt-2 text-red-500">{formError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerComments;