import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup"; 
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ForgotPassword from "./components/ForgotPassword"; 
import AdminApp from './Admin/AdminApp'; // Import AdminApp
import SellerApp from './Seller/SellerApp';
import Navbar from "./components/Navbar"; // General Navbar Component

function ShowNavbar() {
  const location = useLocation();
  // Exclude Navbar for '/admin' and '/seller' routes
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/seller')) {
    return null;
  }
  return <Navbar />;
}

function App() {
  return (
    <Router>
      <ShowNavbar /> {/* Conditionally render the Navbar */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/*" element={<AdminApp />} /> {/* Admin routes */}
        <Route path="/seller/*" element={<SellerApp />} /> {/* Seller routes */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
