// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">ETC</Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
