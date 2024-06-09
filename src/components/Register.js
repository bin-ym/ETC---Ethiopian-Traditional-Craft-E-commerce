// src/components/Register.js
import React, { useState } from 'react';
import './Register.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        // Implement registration logic here
    };

    return (
        <div className="register">
            <h2>Register</h2>
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
                <label>
                    Confirm Password<br />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </label>
                <br />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
