import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; // Added import
import { translateText } from "../utils/translate"; // Added import

const CustomerOrderDetails = () => {
  const { language } = useLanguage(); // Added hook
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, language]); // Added language to dependencies

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/orders/customer/${orderId}`, {
        withCredentials: true,
      });
      console.log("Fetched Order Details:", response.data);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.error || translateText("Failed to fetch order details. Please try again.", language));
      console.error("Error fetching order details:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = () => {
    navigate("/payment-page", {
      state: {
        orderId: order._id,
        amount: order.totalAmount,
        email: order.customerEmail || "",
        first_name: order.customerFirstName || "",
        last_name: order.customerLastName || "",
        phone_number: order.customerPhoneNumber || "",
        tx_ref: `tx-${order._id}-${Date.now()}`,
      },
    });
  };

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">{translateText("Order Details", language)}</h1>

      {loading && (
        <p className="text-center text-gray-500">
          <svg className="inline w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z"></path>
          </svg>
          {translateText("Loading order details...", language)}
        </p>
      )}

      {error && (
        <div className="text-center">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={fetchOrderDetails}
            className="px-4 py-2 mt-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {translateText("Retry", language)}
          </button>
          <Link to="/customer/orders" className="block mt-2 text-blue-600 hover:underline">
            {translateText("Back to Orders", language)}
          </Link>
        </div>
      )}

      {!loading && !error && order && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{translateText("Order", language)} #{order._id}</h2>
            <div className="mt-4 space-y-2 text-gray-700">
              <p>
                <span className="font-medium">{translateText("Total Amount", language)}:</span> {order.totalAmount.toFixed(2)} Br
              </p>
              <p>
                <span className="font-medium">{translateText("Order Status", language)}:</span> {translateText(order.status, language)}
              </p>
              <p>
                <span className="font-medium">{translateText("Payment Status", language)}:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${
                    order.paymentStatus === "Success"
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {translateText(order.paymentStatus, language)}
                </span>
              </p>
              <p>
                <span className="font-medium">{translateText("Order Date", language)}:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {(order.customerEmail || order.customerFirstName || order.customerLastName || order.customerPhoneNumber) && (
            <div className="mb-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-800">{translateText("Customer Information", language)}</h3>
              <div className="space-y-2 text-gray-700">
                {order.customerEmail && (
                  <p>
                    <span className="font-medium">{translateText("Email", language)}:</span> {order.customerEmail}
                  </p>
                )}
                {(order.customerFirstName || order.customerLastName) && (
                  <p>
                    <span className="font-medium">{translateText("Name", language)}:</span>{" "}
                    {order.customerFirstName} {order.customerLastName}
                  </p>
                )}
                {order.customerPhoneNumber && (
                  <p>
                    <span className="font-medium">{translateText("Phone", language)}:</span> {order.customerPhoneNumber}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-3 text-xl font-semibold text-gray-800">{translateText("Products", language)}</h3>
            <table className="min-w-full border-t">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">{translateText("Product Name", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Price", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Quantity", language)}</th>
                  <th className="px-4 py-2 text-left">{translateText("Total", language)}</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.price.toFixed(2)} Br</td>
                    <td className="px-4 py-2">{product.quantity}</td>
                    <td className="px-4 py-2">{(product.price * product.quantity).toFixed(2)} Br</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/customer/orders"
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
            >
              {translateText("Back to Orders", language)}
            </Link>
            {order.paymentStatus === "Pending" && (
              <button
                onClick={handlePayNow}
                className="px-6 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                {translateText("Pay Now", language)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrderDetails;