import React, { useState } from 'react';
import axios from 'axios';
import './OrderStatus.css';

const OrderStatus = () => {
  const userId = localStorage.getItem('userId');  // Get current user ID
  const [orderId, setOrderId] = useState('');
  const [orderDetails, setOrderDetails] = useState([]);
  const [error, setError] = useState('');

  const handleFetchOrder = async () => {
    try {
      const response = await axios.get(`http://localhost:8800/order-status`, {
        params: { user_id: userId, order_id: orderId }
      });

      if (response.data.length > 0) {
        setOrderDetails(response.data);  // Store all orders in state
        setError('');  // Clear any previous error
      } else {
        setError('No order found with this Order ID.');
        setOrderDetails([]);  // Clear the previous result if not found
      }
    } catch (err) {
      setError('Error fetching order details.');
      console.error("Error fetching order status:", err);
    }
  };

  // Updated handleCancelOrder to work with your backend using the id from order_products
  const handleCancelOrder = async (orderProductId) => {
    try {
      // Send DELETE request to remove the order entry by the order product's id (not orderId)
      const response = await axios.delete(`http://localhost:8800/order-products/${orderProductId}`);
      
      if (response.status === 200) {
        alert('Order canceled successfully!');

        // Refetch the orders after cancellation to update the UI
        handleFetchOrder();
      } else {
        alert('Error canceling order. Please try again.');
      }
    } catch (err) {
      console.error('Error canceling order:', err);
      alert('Error canceling the order.');
    }
  };

  return (
    <div className="order-status-container">
      <h2>Check Order Status</h2>
      <div className="order-status-form">
        <label>Enter Order ID:</label>
        <input
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />
        <button onClick={handleFetchOrder}>Check Status</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {orderDetails.length > 0 && (
        <div className="order-details">
          <h3>Order Details</h3>
          <ul>
            {orderDetails.map((order, index) => (
              <li key={index}>
                <p><strong>Product:</strong> {order.product_name}</p>
                <p><strong>Purchase Date:</strong> {order.purchase_date}</p>
                <p><strong>Delivery Date:</strong> {order.ship_date}</p>
                <p><strong>Store Address:</strong> {order.store_address || 'N/A'}</p>
                <p><strong>Price:</strong> ${order.price}</p>
                <button onClick={() => handleCancelOrder(order.id)}>Cancel Order</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;
