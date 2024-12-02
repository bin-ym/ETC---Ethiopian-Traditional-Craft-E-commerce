import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    const calculateTotalPrice = () =>
        cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = () => {
        // Pass the cart total to the checkout page
        navigate('/checkout', { state: { totalAmount: calculateTotalPrice() } });
    };

    return (
        <div className="py-12 text-white bg-gradient-to-r from-indigo-900 via-purple-700 to-indigo-900">
            <div className="container mx-auto">
                <h2 className="mb-8 text-4xl font-bold text-center">Shopping Cart</h2>
                {cartItems.length === 0 ? (
                    <p className="text-center text-gray-300">Your cart is empty.</p>
                ) : (
                    <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-8">
                        <div className="flex-grow bg-white rounded-lg shadow-lg">
                            <table className="w-full text-gray-800 rounded-lg">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="px-4 py-2">Item Name</th>
                                        <th className="px-4 py-2">Price</th>
                                        <th className="px-4 py-2">Quantity</th>
                                        <th className="px-4 py-2">Total</th>
                                        <th className="px-4 py-2">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2">${item.price}</td>
                                            <td className="flex items-center px-4 py-2">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            Math.max(1, item.quantity - 1)
                                                        )
                                                    }
                                                    className="px-2 py-1 bg-gray-300 rounded-l hover:bg-gray-400"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4">{item.quantity}</span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="px-2 py-1 bg-gray-300 rounded-r hover:bg-gray-400"
                                                >
                                                    +
                                                </button>
                                            </td>
                                            <td className="px-4 py-2">${item.price * item.quantity}</td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex-shrink-0 w-full p-6 bg-black rounded-lg shadow-lg lg:w-1/3">
                            <h3 className="mb-4 text-2xl font-bold">Cart Total</h3>
                            <p className="mb-6 text-lg">
                                Total: ${calculateTotalPrice().toFixed(2)}
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-3 text-lg font-semibold text-white bg-indigo-600 rounded hover:bg-indigo-700"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
