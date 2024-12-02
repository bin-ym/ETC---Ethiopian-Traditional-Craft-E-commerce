import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
            <Link to={`/products/${product.id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded mb-4"
                />
                <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                <p className="text-primary font-semibold mb-2">{product.price}</p>
                <div className="flex justify-between items-center">
                    <FaHeart className="text-gray-400 hover:text-red-500 cursor-pointer" />
                    <FaShoppingCart className="text-gray-400 hover:text-green-500 cursor-pointer" />
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
