import React, { useState, useContext, useEffect } from 'react';
import { Button, Input, Modal, Select, Result, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, MoneyCollectOutlined } from '@ant-design/icons';
import { CartContext } from '../contexts/CartContext'; // Assuming this is where CartContext is defined
const { v4: uuid4 } = require('uuid');

function App() {
  const [modal, setModal] = useState({ open: false, success: false, error: false });
  const [input, setInput] = useState({
    fName: "",
    lName: "",
    email: "",
    pNumber: "",
    amount: "",
    currency: "ETB",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Using CartContext to get cart items and calculate total price
  const { cartItems } = useContext(CartContext);

  // Calculate the total price from cart items
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  useEffect(() => {
    // Update amount to total cart price when cart items change
    setInput((prevInput) => ({ ...prevInput, amount: calculateTotal() }));
  }, [cartItems]);

  const acceptPayment = () => {
    const tx_ref = uuid4();
    setIsLoading(true);
    fetch('http://localhost:3001/accept-payment', {
      method: "POST",
      body: JSON.stringify({
        amount: input.amount,
        currency: input.currency,
        email: input.email,
        first_name: input.fName,
        last_name: input.lName,
        phone_number: input.pNumber,
        tx_ref: tx_ref,
      }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(res => {
        setInput({
          fName: "",
          lName: "",
          email: "",
          pNumber: "",
          amount: "",
          currency: "ETB"
        });
        if (res.success) {
          console.log("Response", res);
          setModal({ ...modal, success: true, open: false });
          setTimeout(() => {
            window.location.href = JSON.parse(res.success.body).data.checkout_url;
          }, 5000);
        } else {
          console.log("Error", res);
          setModal({ ...modal, error: true, open: false });
        }
      })
      .catch(err => {
        console.log("Error", err);
        setModal({ ...modal, error: true, open: false });
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    acceptPayment();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput({
      ...input,
      [name]: value
    });
  };

  return (
    <>
      <div className='flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500'>
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <h2 className='mb-6 text-3xl font-bold text-center text-primary'>Welcome! Make Your Payment</h2>
          <Button
            type='primary'
            className='w-full py-3 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600'
            onClick={() => setModal({ open: true })}
          >
            Pay Now With Chapa
          </Button>

          <Modal
            title={<p className='m-0 text-lg font-semibold text-center'>Payment Details</p>}
            open={modal.open}
            maskClosable={false}
            footer={null}
            onCancel={() => setModal({ open: false })}
            className="custom-modal"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor='fname' className="block font-semibold text-gray-700">First Name</label>
                <Input
                  name='fName'
                  value={input.fName}
                  onChange={handleChange}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  id='fname'
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor='lname' className="block font-semibold text-gray-700">Last Name</label>
                <Input
                  name='lName'
                  value={input.lName}
                  onChange={handleChange}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  id='lname'
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor='email' className="block font-semibold text-gray-700">Email</label>
                <Input
                  name='email'
                  value={input.email}
                  onChange={handleChange}
                  type='email'
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  id='email'
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor='pNumber' className="block font-semibold text-gray-700">Phone Number</label>
                <Input
                  name='pNumber'
                  value={input.pNumber}
                  onChange={handleChange}
                  type='tel'
                  required
                  prefix={<PhoneOutlined className="site-form-item-icon" />}
                  id='pNumber'
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor='amount' className="block font-semibold text-gray-700">Amount</label>
                <Input
                  name='amount'
                  value={input.amount}
                  onChange={handleChange}
                  type='number'
                  prefix={<MoneyCollectOutlined />}
                  min='1'
                  id='amount'
                  required
                  className="w-full"
                  disabled // The amount is automatically fetched from the cart
                />
              </div>
              <div>
                <label htmlFor='currency' className="block font-semibold text-gray-700">Currency</label>
                <Select
                  style={{ width: '100%' }}
                  className="w-full"
                  defaultValue="ETB"
                  id='currency'
                  options={[
                    { value: 'ETB', label: 'ETB' },
                    { value: 'USD', label: 'USD' },
                  ]}
                  onChange={(value) => setInput({ ...input, currency: value })}
                />
              </div>
              <div className="mt-6 text-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full py-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? <Spin /> : 'Proceed to Payment'}
                </Button>
              </div>
            </form>
          </Modal>

          <Modal
            title={<p className='m-0 text-lg font-semibold text-center'>Success</p>}
            open={modal.success}
            closable={false}
            footer={null}
            className="custom-modal"
          >
            <Result
              status="success"
              title="Successfully Uploaded Payment Details"
              subTitle="You will be redirected to the payment page shortly."
            />
          </Modal>

          <Modal
            title={<p className='m-0 text-lg font-semibold text-center'>Error</p>}
            open={modal.error}
            closable={true}
            maskClosable={true}
            footer={[
              <Button key="cancel" onClick={() => setModal({ ...modal, error: false })} type='primary' danger>
                Cancel
              </Button>,
              <Button key="ok" onClick={() => setModal({ ...modal, error: false })} type='primary'>
                Try Again
              </Button>,
            ]}
            className="custom-modal"
          >
            <Result
              status="error"
              title="Error Uploading Payment Details"
            />
          </Modal>
        </div>
      </div>
    </>
  );
}

export default App;
