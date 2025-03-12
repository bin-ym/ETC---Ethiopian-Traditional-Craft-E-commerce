import React, { useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import { translateText } from "../utils/translate";

const Cart = () => {
  const { language } = useLanguage();
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const calculateTotalPrice = useMemo(() => 
    cartItems.reduce((total, item) => total + (item.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    if (newQuantity > item.stock) {
      alert(translateText(`Maximum available stock is ${item.stock}`, language));
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (!cartItems.length) return;
    
    setIsCheckingOut(true);
    navigate("/checkout", {
      state: { cartItems, totalAmount: calculateTotalPrice }
    });
    setIsCheckingOut(false);
  };

  if (!cartItems.length) {
    return (
      <div className="min-h-screen px-4 py-12 bg-gray-100">
        <div className="mx-auto text-center max-w-7xl">
          <h2 className="mb-10 text-4xl font-extrabold text-indigo-600">
            {translateText("🛒 Your Shopping Cart", language)}
          </h2>
          <div className="p-10 bg-white rounded-lg shadow-md">
            <p className="mb-6 text-xl text-gray-600">{translateText("Your cart is empty.", language)}</p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {translateText("🛍️ Start Shopping", language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-4xl font-extrabold tracking-tight text-center text-indigo-600">
          {translateText("🛒 Your Shopping Cart", language)}
        </h2>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-white border rounded-lg shadow-md">
                <div className="flex items-center space-x-6">
                  <img
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name}
                    className="object-cover w-20 h-20 rounded-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.price.toFixed(2)} Br {translateText("each", language)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {translateText("Stock Remaining", language)}: {item.stock}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                      className="p-2 text-gray-700 hover:bg-gray-200 rounded-l-md"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, Math.min(item.quantity + 1, item.stock))}
                      className="p-2 text-gray-700 hover:bg-gray-200 rounded-r-md"
                      disabled={item.quantity >= item.stock}
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <p className="text-lg font-semibold">{(item.price * item.quantity).toFixed(2)} Br</p>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white border rounded-lg shadow-md lg:sticky lg:top-24">
            <h3 className="mb-6 text-2xl font-bold text-indigo-600">
              {translateText("Cart Summary", language)}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>{translateText("Subtotal", language)}</span>
                <span className="font-semibold">{calculateTotalPrice.toFixed(2)} Br</span>
              </div>
              <div className="flex justify-between pt-4 text-lg border-t">
                <span className="font-bold">{translateText("Total", language)}</span>
                <span className="font-bold text-indigo-600">{calculateTotalPrice.toFixed(2)} Br</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`w-full py-3 mt-6 text-lg font-bold text-white rounded-md shadow-lg ${
                isCheckingOut 
                  ? "bg-indigo-400 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isCheckingOut ? translateText("Processing...", language) : translateText("✅ Proceed to Checkout", language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;