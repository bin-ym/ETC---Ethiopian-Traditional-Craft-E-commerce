// CartContext.js
import React, { createContext, useState, useCallback } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Add item to cart
  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { 
                ...cartItem, 
                quantity: Math.min(
                  cartItem.quantity + item.quantity,
                  cartItem.stock // Ensure we don't exceed stock
                )
              }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: Math.min(item.quantity, item.stock) }];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, newQuantity) => {
    setCart((prevCart) => {
      return prevCart.map((cartItem) =>
        cartItem.id === itemId
          ? { 
              ...cartItem, 
              quantity: Math.max(1, Math.min(newQuantity, cartItem.stock))
            }
          : cartItem
      );
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.id !== itemId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Get total items in cart
  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Get total price
  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const value = {
    cartItems: cart, // Changed from 'cart' to match Cart component usage
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};