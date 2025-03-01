import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/comments/admin", {
        withCredentials: true,
      });
      setComments(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch comments.");
      console.error("Error fetching comments:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/comments/admin/${id}`, {
        withCredentials: true,
      });
      setComments(comments.filter((comment) => comment._id !== id));
      console.log("✅ Comment Deleted:", id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete comment.");
      console.error("Error deleting comment:", err.response?.data || err.message);
    }
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">Admin Comments</h1>
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
            <button
              onClick={fetchComments}
              className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Comment</th>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr key={comment._id}>
                      <td className="px-4 py-2">{comment.text}</td>
                      <td className="px-4 py-2">{comment.userId?.name || "Unknown User"}</td>
                      <td className="px-4 py-2">{comment.productId?.name || "Unknown Product"}</td>
                      <td className="px-4 py-2">{new Date(comment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                      No comments found.
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

export default AdminComments;