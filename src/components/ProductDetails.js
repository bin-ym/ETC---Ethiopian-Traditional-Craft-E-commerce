// src/components/ProductDetails.js
import React from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    // Fetch product details using id
    const product = {
        name: 'Sample Product',
        description: 'This is a sample product description.',
        price: '$100'
    };

    return (
        <div className="product-details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: {product.price}</p>
            <button>Add to Cart</button>
        </div>
    );
};

export default ProductDetails;
