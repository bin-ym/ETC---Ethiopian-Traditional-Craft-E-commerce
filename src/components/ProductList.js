import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import './ProductList.css';
import EthiopiaImage from '../photo/ethiopia.jpg';
import MesobImage from '../photo/mesob.jpg';

const ProductList = () => {
    const products = [
        { id: 1, name: 'Ethiopian Craft 1', price: '$50', image: EthiopiaImage },
        { id: 2, name: 'Ethiopian Craft 2', price: '$100', image: EthiopiaImage },
        { id: 3, name: 'Ethiopian Craft 3', price: '$150', image: MesobImage },
        { id: 4, name: 'Ethiopian Craft 4', price: '$50', image: EthiopiaImage },
        { id: 5, name: 'Ethiopian Craft 5', price: '$100', image: EthiopiaImage },
        { id: 6, name: 'Ethiopian Craft 6', price: '$150', image: MesobImage },
    ];

    return (
        <div className="page-container">
            <aside className="sidebar">
                <h3>Price</h3>
                <ul>
                    <li>Free</li>
                    <li>Paid</li>
                </ul>
                <h3>Industry</h3>
                <ul>
                    <li>Arts and Crafts</li>
                    <li>Baby and Kids</li>
                    <li>Books, Music, and Video</li>
                    <li>Business Equipment and Supplies</li>
                </ul>
            </aside>
            <div className="product-list-container">
                <div className="product-list">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <Link to={`/products/${product.id}`}>
                                <img src={product.image} alt={product.name} className="product-image" />
                                <div className="product-title">{product.name}</div>
                                <div className="price">{product.price}</div>
                                <FaHeart className="heart-icon" />
                                <FaShoppingCart className="cart-icon" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
