// src/api/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const registerUser = (userData) => API.post('/users/register', userData);
export const loginUser = (userData) => API.post('/users/login', userData);
export const fetchProducts = () => API.get('/products');
export const fetchProductDetails = (id) => API.get(`/products/${id}`);
export const addToCart = (cartData) => API.post('/cart', cartData);
export const checkout = (orderData) => API.post('/orders', orderData);
