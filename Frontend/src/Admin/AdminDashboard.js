import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [productsCount, setProductsCount] = useState(120);
    const [ordersCount, setOrdersCount] = useState(34);
    const [usersCount, setUsersCount] = useState(500);

    useEffect(() => {
        // Simulate fetching dynamic data (we'll replace this with backend data later)
        setProductsCount(120); // Replace with dynamic data
        setOrdersCount(34); // Replace with dynamic data
        setUsersCount(500); // Replace with dynamic data
    }, []);

    const data = {
        labels: ['Products', 'Orders', 'Users'],
        datasets: [
            {
                label: 'Total Count',
                data: [productsCount, ordersCount, usersCount],
                backgroundColor: ['#34D399', '#FBBF24', '#60A5FA'],
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Dashboard Overview',
            },
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="min-h-screen text-white bg-gradient-to-r from-green-500 to-teal-600">
            <main className="container px-6 py-12 mx-auto">
                <section id="dashboard" className="mb-8">
                    <h2 className="mb-4 text-3xl font-bold">Overview</h2>
                    <p>Welcome, Admin! Here is a quick overview of your store:</p>
                    <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Products</h3>
                            <Bar data={data} options={options} />
                        </div>
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Orders</h3>
                            <Bar data={data} options={options} />
                        </div>
                        <div className="p-6 bg-white rounded shadow-md">
                            <h3 className="mb-2 text-lg font-bold text-green-600">Users</h3>
                            <Bar data={data} options={options} />
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
