// OrderManagement.js
import React, { useState } from "react";

const OrderManagement = () => {
  const initialOrders = [
    { id: 1, customer: "Jane Doe", total: "$200", status: "Pending", date: "2024-12-01" },
    { id: 2, customer: "John Smith", total: "$50", status: "Shipped", date: "2024-11-30" },
    { id: 3, customer: "Alice Johnson", total: "$150", status: "Pending", date: "2024-12-02" },
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("All");

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="mb-4 text-3xl font-bold">Order Management</h1>

      <div className="mb-4">
        <label htmlFor="statusFilter" className="mr-2">Filter by Status:</label>
        <select
          id="statusFilter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
        </select>
      </div>

      <div className="p-6 bg-white rounded shadow-md">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Order Date</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-2">{order.customer}</td>
                <td className="px-4 py-2">{order.total}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">{order.date}</td>
                <td className="px-4 py-2">
                  <button className="px-4 py-1 text-white bg-blue-500 rounded">View</button>
                  <button className="px-4 py-1 ml-2 text-white bg-red-500 rounded">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;