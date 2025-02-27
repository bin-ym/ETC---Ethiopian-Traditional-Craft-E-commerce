import React from 'react';

const AdminOverview = () => {
    return (
        <section>
            <h2 className="mb-4 text-3xl font-bold">Overview</h2>
            <p>Welcome, Admin! Here is a quick overview of your store:</p>
            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                <div className="p-6 bg-white rounded shadow-md">
                    <h3 className="mb-2 text-lg font-bold text-green-600">Products</h3>
                    <p>Total: 120</p>
                </div>
                <div className="p-6 bg-white rounded shadow-md">
                    <h3 className="mb-2 text-lg font-bold text-green-600">Orders</h3>
                    <p>Pending: 34</p>
                </div>
                <div className="p-6 bg-white rounded shadow-md">
                    <h3 className="mb-2 text-lg font-bold text-green-600">Users</h3>
                    <p>Registered: 500</p>
                </div>
            </div>
        </section>
    );
};

export default AdminOverview;
