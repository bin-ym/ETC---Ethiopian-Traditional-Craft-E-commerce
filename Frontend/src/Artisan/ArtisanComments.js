import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const ArtisanComments = () => {
  const { language } = useLanguage();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("✅ WebSocket connected for comments");
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("📩 WebSocket message:", message);
      if (message === "New comment added") {
        fetchComments(); // Refresh comments on new comment notification
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    return () => ws.close(); // Cleanup on unmount
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/api/comments/artisan", {
        withCredentials: true,
      });
      setComments(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch comments.", language));
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains unchanged
  return (
    <div className="container px-6 py-12 mx-auto">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-800">{translateText("Comments on My Products", language)}</h1>
        {/* ... rest of JSX ... */}
      </div>
    </div>
  );
};

export default ArtisanComments;