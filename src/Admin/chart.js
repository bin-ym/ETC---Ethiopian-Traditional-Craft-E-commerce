import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

// Register necessary chart components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const AdminDashboard = () => {
    const [data, setData] = useState({
        products: 0,
        orders: 0,
        users: 0,
    });

    // Simulate fetching data from an API or backend
    useEffect(() => {
        // Replace with actual data fetching logic
        setData({
            products: 120, // Simulated data for products
            orders: 34, // Simulated data for orders
            users: 500, // Simulated data for users
        });
    }, []);

    // Pie chart data structure
    const chartData = {
        labels: ['Products', 'Orders', 'Users'],
        datasets: [
            {
                label: 'Overview',
                data: [data.products, data.orders, data.users], // Using the state values for the chart
                backgroundColor: ['#4CAF50', '#FF9800', '#2196F3'], // Colors for each segment
                borderColor: ['#388E3C', '#F57C00', '#1976D2'], // Border colors for each segment
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="min-h-screen text-white bg-gradient-to-r from-green-500 to-teal-600">
            {/* Main Content */}
            <main className="container px-6 py-12 mx-auto">
                <section id="dashboard" className="mb-8">
                    <h2 className="mb-4 text-3xl font-bold">Overview</h2>
                    <p>Welcome, Admin! Here is a quick overview of your store:</p>
                    <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                        {/* Products Overview */}
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Products</h3>
                            <p>Total: {data.products}</p>
                        </div>

                        {/* Orders Overview */}
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Orders</h3>
                            <p>Pending: {data.orders}</p>
                        </div>

                        {/* Users Overview */}
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Users</h3>
                            <p>Registered: {data.users}</p>
                        </div>
                    </div>
                </section>

                {/* Pie Chart Section */}
                <section id="overview" className="mb-8">
                    <h2 className="mb-4 text-3xl font-bold">Store Overview (Pie Chart)</h2>
                    <Pie data={chartData} />
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
