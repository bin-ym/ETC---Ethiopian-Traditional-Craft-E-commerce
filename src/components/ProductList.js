import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import EthiopiaImage from '../photo/ethiopia.jpg';
import MesobImage from '../photo/mesob.jpg';

const ProductList = () => {
    const products = [
        { id: 1, name: 'Ethiopian Craft 1', price: 50, image: EthiopiaImage },
        { id: 2, name: 'Ethiopian Craft 2', price: 100, image: EthiopiaImage },
        { id: 3, name: 'Ethiopian Craft 3', price: 150, image: MesobImage },
    ];

    return (
        <div className="py-12 text-white bg-gradient-to-r from-indigo-900 via-purple-700 to-indigo-900">
            <div className="container px-6 mx-auto">
                <h2 className="mb-12 text-4xl font-extrabold text-center">Our Products</h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="transition-transform transform bg-white rounded-lg shadow-lg hover:scale-105"
                        >
                            <Link to={`/products/${product.id}`}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-56 rounded-t-lg"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                                    <p className="my-4 text-lg font-semibold text-indigo-600">
                                        ${product.price}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <Link
                                            to={`/products/${product.id}`}
                                            className="text-indigo-600 hover:underline"
                                        >
                                            View Details
                                        </Link>
                                        <div className="flex space-x-3">
                                            <FaHeart className="text-gray-400 cursor-pointer hover:text-red-500" />
                                            <FaShoppingCart className="text-gray-400 cursor-pointer hover:text-green-500" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
