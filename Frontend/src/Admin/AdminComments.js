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
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-6 text-3xl font-bold tracking-wide text-indigo-600 animate-fade-in-down">
            Admin Comments
          </h1>
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
              <p className="ml-2 text-gray-600">Loading comments...</p>
            </div>
          )}
          {error && (
            <div className="py-6 text-center">
              <p className="mb-4 font-medium text-red-500">{error}</p>
              <button
                onClick={fetchComments}
                className="px-6 py-2 text-white transition-all duration-300 transform bg-indigo-600 rounded-md shadow-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1"
              >
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">Comment</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">User</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">Product</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">Date</th>
                    <th className="px-6 py-3 font-semibold text-left text-indigo-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <tr key={comment._id} className="transition-colors duration-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-800">{comment.text}</td>
                        <td className="px-6 py-4 text-gray-800">{comment.userId?.name || "Unknown User"}</td>
                        <td className="px-6 py-4 text-gray-800">{comment.productId?.name || "Unknown Product"}</td>
                        <td className="px-6 py-4 text-gray-800">{new Date(comment.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="px-4 py-2 text-white transition-all duration-300 transform bg-red-500 rounded-md shadow-md hover:bg-red-600 hover:shadow-lg hover:-translate-y-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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

export default AdminComments;