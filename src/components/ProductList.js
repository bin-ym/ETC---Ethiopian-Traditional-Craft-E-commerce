// src/components/ProductList.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
    const products = [
        { id: 1, name: 'Product 1', price: '$50' },
        { id: 2, name: 'Product 2', price: '$100' },
        { id: 3, name: 'Product 3', price: '$150' }
    ];

    return (
        <div className="product-list">
            <h2>Products</h2>
            <ul>
                {products.map((product) => (
                    <li key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            {product.name} - {product.price}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
