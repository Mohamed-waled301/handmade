const API_BASE_URL = 'http://localhost:5000/api';

export const createPaymobHostedPayment = async ({
  amount,
  customerName,
  customerPhone,
  paymentMethod,
  merchantOrderId
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/paymob/create-hosted-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        customerName,
        customerEmail: 'test@example.com',
        customerPhone,
        paymentMethod: paymentMethod.toUpperCase(), // 'CARD', 'WALLET', 'INSTAPAY'
        merchantOrderId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intention from Paymob');
    }

    const data = await response.json();
    return data; // returns { redirect_url, orderId }
  } catch (error) {
    console.error('Paymob Hosted Service Error:', error);
    throw error;
  }
};

export const fetchOrderStatus = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/paymob/order-status/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction status');
    }
    const data = await response.json();
    return data; // returns { orderId, status, transactionId, paymentMethod, amount }
  } catch (error) {
    console.error('Order Status Fetch Error:', error);
    throw error;
  }
};
