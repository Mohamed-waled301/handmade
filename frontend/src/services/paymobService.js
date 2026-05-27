const API_BASE_URL = 'http://localhost:5000/api';

const HEADERS = {
  'Content-Type': 'application/json',
  'x-app-client': 'HandmadeFrontend' // CSRF Header
};

export const createOrder = async ({ items, customerName, customerPhone, customerAddress, governorate, promoCode, paymentMethod }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/create`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ items, customerName, customerPhone, customerAddress, governorate, promoCode, paymentMethod })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create order');
    }
    return await response.json();
  } catch (error) {
    console.error('Order Creation Error:', error);
    throw error;
  }
};

export const createPaymobHostedPayment = async ({ orderId }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/paymob/create-hosted-payment`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ orderId })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create payment intention');
    }
    return await response.json();
  } catch (error) {
    console.error('Paymob Hosted Service Error:', error);
    throw error;
  }
};

export const fetchOrderStatus = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch order status');
    }
    return await response.json();
  } catch (error) {
    console.error('Order Status Fetch Error:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: HEADERS
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to cancel order');
    }
    return await response.json();
  } catch (error) {
    console.error('Order Cancellation Error:', error);
    throw error;
  }
};

export const uploadInstaPayReceipt = async (orderId, formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/upload-receipt`, {
      method: 'POST',
      headers: {
        'x-app-client': 'HandmadeFrontend' // CSRF Header (No Content-Type here, fetch adds multipart/form-data boundary automatically)
      },
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload receipt');
    }
    return await response.json();
  } catch (error) {
    console.error('InstaPay Upload Error:', error);
    throw error;
  }
};
