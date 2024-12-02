import React, { useState, useEffect } from 'react';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Simulate fetching products data (replace with real API call)
        const fetchedProducts = [
            { id: 1, name: 'Product A', price: '$50', stock: 100, seller: 'John Doe', sold: 20 },
            { id: 2, name: 'Product B', price: '$30', stock: 50, seller: 'Jane Smith', sold: 10 },
            { id: 3, name: 'Product C', price: '$20', stock: 75, seller: 'Sam Wilson', sold: 30 },
        ];
        setProducts(fetchedProducts);
    }, []);

    return (
        <div className="min-h-screen text-black bg-gradient-to-r from-green-500 to-teal-600">
            <div className="container px-6 py-12 mx-auto">
                <h2 className="mb-6 text-3xl font-bold">Manage Products</h2>
                <table className="min-w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Product Name</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Stock</th>
                            <th className="px-4 py-2 text-left">Seller</th>
                            <th className="px-4 py-2 text-left">Units Sold</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2">{product.name}</td>
                                <td className="px-4 py-2">{product.price}</td>
                                <td className="px-4 py-2">{product.stock}</td>
                                <td className="px-4 py-2">{product.seller}</td>
                                <td className="px-4 py-2">{product.sold}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
