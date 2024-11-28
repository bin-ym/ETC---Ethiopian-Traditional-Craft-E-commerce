// src/components/Cart.js
import React, { useContext } from 'react';
import './Cart.css';
import { CartContext } from '../contexts/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart } = useContext(CartContext);

    return (
        <div className="cart">
            <h2>Shopping Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul>
                    {cartItems.map((item) => (
                        <li key={item.id}>
                            {item.name} - {item.price}
                            <button onClick={() => removeFromCart(item.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Cart;
