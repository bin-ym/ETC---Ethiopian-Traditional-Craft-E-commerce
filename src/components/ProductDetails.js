// src/components/ProductDetails.js
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetails.css';
import { CartContext } from '../contexts/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);

    const product = {
        id,
        name: 'Sample Product',
        description: 'This is a sample product description.',
        price: '$100'
    };

    return (
        <div className="product-details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: {product.price}</p>
            <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
    );
};

export default ProductDetails;
