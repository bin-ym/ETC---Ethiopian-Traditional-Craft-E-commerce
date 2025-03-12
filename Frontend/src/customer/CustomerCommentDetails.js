import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const CustomerCommentDetails = () => {
  const { language } = useLanguage(); // Added hook
  const { id } = useParams();
  const [comment, setComment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || id === "undefined") {
      setError(translateText("Invalid comment ID. Please select a valid comment.", language));
      setLoading(false);
      return;
    }
    fetchComment();
  }, [id, language]); // Added language to dependencies

  const fetchComment = async () => {
    console.log("📥 Fetching comment details for ID:", id);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/comments/customer/${id}`, {
        withCredentials: true,
      });
      console.log("✅ Comment fetched:", response.data);
      setComment(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || translateText("Failed to fetch comment details.", language);
      console.error("❌ Error fetching comment:", err.response?.data || err.message);
      setError(errorMsg);
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h1 className="mb-6 text-3xl font-bold text-indigo-600">{translateText("Comment Details", language)}</h1>
          {loading && (
            <p className="text-gray-600">
              <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
              </svg>
              {translateText("Loading...", language)}
            </p>
          )}
          {error && (
            <div className="text-center">
              <p className="text-red-500">{error}</p>
              <Link to="/customer/comments" className="block mt-2 text-indigo-600 hover:underline">
                {translateText("Back to Comments", language)}
              </Link>
            </div>
          )}
          {comment && !loading && !error && (
            <div className="space-y-4">
              <p><strong>{translateText("Comment", language)}:</strong> {comment.text}</p>
              <p><strong>{translateText("Product", language)}:</strong> {comment.productId?.name || translateText("Deleted Product", language)}</p>
              <p><strong>{translateText("Date", language)}:</strong> {new Date(comment.createdAt).toLocaleString()}</p>
              {comment.productId?.image && (
                <img
                  src={`${API_BASE_URL}${comment.productId.image}`}
                  alt={comment.productId.name}
                  className="object-cover w-32 h-32 rounded-md"
                />
              )}
              <Link
                to="/customer/comments"
                className="inline-block px-4 py-2 mt-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {translateText("Back to Comments", language)}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerCommentDetails;