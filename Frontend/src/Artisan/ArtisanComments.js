import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ArtisanComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("ArtisanComments: Component mounted");
    fetchComments();
  }, []);

  const fetchComments = async () => {
    console.log("ArtisanComments: Fetching comments...");
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/comments/artisan", {
        withCredentials: true,
      });
      console.log("ArtisanComments: Successfully fetched comments:", response.data);
      setComments(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to fetch comments.";
      console.error("ArtisanComments: Error fetching comments:", err.response?.data || err.message);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("ArtisanComments: Loading set to false, rendering should proceed");
    }
  };

  console.log("ArtisanComments: Rendering with state - loading:", loading, "error:", error, "comments:", comments);

  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">Comments on My Products</h1>
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
            <Link to="/login" className="block mt-2 text-blue-600 hover:underline">
              Go to Login
            </Link>
          </div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Comment</th>
                  <th className="px-4 py-2 text-left">Customer</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr key={comment._id} className="border-b">
                      <td className="px-4 py-2">{comment.text}</td>
                      <td className="px-4 py-2">{comment.userId?.name || "Unknown Customer"}</td>
                      <td className="px-4 py-2">{comment.productId?.name || "Product Deleted"}</td>
                      <td className="px-4 py-2">{new Date(comment.createdAt).toLocaleDateString()}</td>
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
      </div>
    </div>
  );
};

export default ArtisanComments;