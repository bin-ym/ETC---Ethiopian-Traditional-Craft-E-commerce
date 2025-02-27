import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentPage = () => {
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState({});
  
  useEffect(() => {
    // Fetch payment details from localStorage or the state passed by navigate
    const data = location.state?.paymentDetails || JSON.parse(localStorage.getItem("paymentDetails"));
    setPaymentDetails(data);
  }, [location]);

  return (
    <div>
      <h1>Payment Page</h1>
      <p>Amount: {paymentDetails.totalAmount}</p>
      {/* Add your Chapa payment logic here */}
    </div>
  );
};

export default PaymentPage;
