// src/components/Checkout.js
import React from 'react';
import './Checkout.css';

const Checkout = () => {
    return (
        <div className="checkout">
            <h2>Checkout</h2>
            <form>
                <label>
                    Name:
                    <input type="text" name="name" />
                </label>
                <br />
                <label>
                    Address:
                    <input type="text" name="address" />
                </label>
                <br />
                <label>
                    Payment Method:
                    <select name="payment">
                        <option value="credit">Credit Card</option>
                        <option value="paypal">PayPal</option>
                    </select>
                </label>
                <br />
                <button type="submit">Place Order</button>
            </form>
        </div>
    );
};

export default Checkout;
