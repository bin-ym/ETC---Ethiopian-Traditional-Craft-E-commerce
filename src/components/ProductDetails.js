import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import EthiopiaImage from '../photo/ethiopia.jpg';
import MesobImage from '../photo/mesob.jpg';

const ProductDetails = () => {
    const { id } = useParams();
    const { cartItems, addToCart } = useContext(CartContext);
    const [addedToCart, setAddedToCart] = useState(false);

    const products = [
        { id: 1, name: 'Ethiopian Craft 1', price: 50, image: EthiopiaImage },
        { id: 2, name: 'Ethiopian Craft 2', price: 100, image: EthiopiaImage },
        { id: 3, name: 'Ethiopian Craft 3', price: 150, image: MesobImage },
    ];

    const product = products.find((p) => p.id.toString() === id);
    const isInCart = cartItems.some((item) => item.id === product.id);

    const handleAddToCart = () => {
        if (!isInCart) {
            addToCart({ ...product, quantity: 1 });
            setAddedToCart(true);
        }
    };

    return (
        <div className="py-12 text-white bg-gradient-to-r from-indigo-900 via-purple-700 to-indigo-900">
            <div className="container px-6 mx-auto">
                <div className="flex flex-col items-center bg-white rounded-lg shadow-lg md:flex-row">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full rounded-t-lg md:rounded-l-lg md:w-1/2"
                    />
                    <div className="p-8 md:w-1/2">
                        <h2 className="mb-4 text-3xl font-bold text-gray-800">{product.name}</h2>
                        <p className="mb-6 text-xl font-semibold text-indigo-600">
                            Price: ${product.price}
                        </p>
                        <button
                            onClick={handleAddToCart}
                            className={`px-6 py-3 text-lg font-semibold rounded shadow ${
                                isInCart || addedToCart
                                    ? 'bg-green-500 cursor-not-allowed'
                                    : 'bg-indigo-500 hover:bg-indigo-600'
                            } text-white`}
                            disabled={isInCart || addedToCart}
                        >
                            {isInCart || addedToCart ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
