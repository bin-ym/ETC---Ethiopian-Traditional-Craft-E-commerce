import React, { useState, useEffect } from 'react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Simulate fetching orders data (replace with real API call)
        const fetchedOrders = [
            { id: 1, orderId: 'ORD001', status: 'Pending' },
            { id: 2, orderId: 'ORD002', status: 'Shipped' },
            { id: 3, orderId: 'ORD003', status: 'Delivered' },
        ];
        setOrders(fetchedOrders);
    }, []);

    return (
        <div className="min-h-screen text-black bg-gradient-to-r from-green-500 to-teal-600">
            <div className="container px-6 py-12 mx-auto">
                <h2 className="mb-6 text-3xl font-bold">Manage Orders</h2>
                <table className="min-w-full bg-white rounded shadow-md">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Order ID</th>
                            <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-100">
                                <td className="px-4 py-2">{order.orderId}</td>
                                <td className="px-4 py-2">{order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
