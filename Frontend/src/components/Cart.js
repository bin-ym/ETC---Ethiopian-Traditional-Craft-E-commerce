import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext"; 

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const calculateTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout", {
      state: { cartItems, totalAmount: calculateTotalPrice() }, // ✅ Pass cart items
    });
  };

  return (
    <div className="py-12 text-white bg-gradient-to-r from-indigo-900 via-purple-700 to-indigo-900">
      <div className="container px-6 mx-auto lg:px-12">
        <h2 className="mb-8 text-4xl font-extrabold text-center">🛒 Shopping Cart</h2>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-300">Your cart is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 mt-4 text-lg font-semibold text-gray-800 transition duration-300 bg-yellow-500 rounded-lg hover:bg-yellow-400"
            >
              🛍️ Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 text-gray-800 bg-white rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="object-cover w-16 h-16 rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-bold">{item.name}</h3>
                      <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 bg-gray-300 rounded-l hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 bg-gray-300 rounded-r hover:bg-gray-400"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="px-4 py-1 text-white transition bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    ❌ Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-yellow-400">Cart Summary</h3>
              <p className="mt-4 text-lg">
                Total: <span className="font-semibold">${calculateTotalPrice().toFixed(2)}</span>
              </p>
              <button
                onClick={handleCheckout}
                className="w-full py-3 mt-6 text-lg font-bold text-white transition bg-green-500 rounded-lg hover:bg-green-600"
              >
                ✅ Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
