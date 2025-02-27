import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import PaymentPage from './components/PaymentPage'; // Import the PaymentPage component
import ForgotPassword from "./components/ForgotPassword";
import AdminApp from "./Admin/AdminApp";
import SellerApp from "./Seller/SellerApp";
import Navbar from "./components/Navbar";
import PaymentSuccess from "./components/PaymentSuccess";

function ShowNavbar() {
  const location = useLocation();
  console.log("Current path:", location.pathname);

  // Skip Navbar for admin and seller routes
  if (location.pathname.includes("/admin") || location.pathname.includes("/seller")) {
    return null;
  }
  return <Navbar />;
}

function App() {
  console.log("App is rendering");
  return (
    <CartProvider>
      <Router>
        <ShowNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/payment-page" element={<PaymentPage />} /> {/* Corrected the route */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/seller/*" element={<SellerApp />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route
            path="*"
            element={
              <div>
                {console.log("Rendering 404 for path:", window.location.pathname)}
                <h1 style={{ textAlign: "center", color: "red" }}>404: Page Not Found</h1>
                <p style={{ textAlign: "center" }}>The requested page does not exist.</p>
              </div>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
