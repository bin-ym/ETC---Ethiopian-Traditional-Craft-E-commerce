// src/components/Login.js
import React, { useState } from 'react';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement login logic here
    };

    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Email<br />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <br />
                <label>
                    Password<br />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
