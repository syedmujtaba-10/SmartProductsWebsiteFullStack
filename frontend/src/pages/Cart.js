import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './NavBar';
import './Cart.css';  // Ensure you import the Cart.css

const Cart = () => {
  const userId = localStorage.getItem('userId');  // Get current user ID
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState(''); // For home delivery
  const [creditCard, setCreditCard] = useState('');
  const [isHomeDelivery, setIsHomeDelivery] = useState(true); // Toggle for delivery type
  const [selectedStore, setSelectedStore] = useState(null);  // Selected store for in-store pickup
  const [stores, setStores] = useState([]);  // List of stores from the backend

  // Fetch logged-in user's shipping address data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/customers/${userId}`);
        const userData = response.data;
        setCustomerName(userData.customer_name);
        setCustomerAddress(`${userData.street}, ${userData.city}, ${userData.state}, ${userData.zip_code}`);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    if (userId) {
      fetchUserData();  // Fetch the user's address and name
    } else {
      console.error("User not logged in");
    }
  }, [userId]);

  // Fetch cart items for the logged-in user
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/cart/${userId}`);
        setCartItems(response.data);
        calculateTotalPrice(response.data);  // Calculate total price
      } catch (error) {
        console.error("Error fetching cart items", error);
      }
    };

    if (userId) {
      fetchCartItems();
    } else {
      console.error("User not logged in");
    }
  }, [userId]);

  // Function to calculate total cart price
  const calculateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // Fetch stores when in-store pickup is selected
  useEffect(() => {
    if (!isHomeDelivery) {
      const fetchStores = async () => {
        try {
          const response = await axios.get('http://localhost:8800/stores');
          setStores(response.data);
        } catch (error) {
          console.error("Error fetching stores", error);
        }
      };

      fetchStores();
    }
  }, [isHomeDelivery]);

  // Function to handle removing item from cart
  const handleRemoveFromCart = async (cartItemId) => {
    try {
      await axios.delete(`http://localhost:8800/cart/item/${cartItemId}`);
      const updatedItems = cartItems.filter(item => item.id !== cartItemId);
      setCartItems(updatedItems);  // Remove item from frontend state
      calculateTotalPrice(updatedItems);  // Update total price after removal
    } catch (err) {
      console.error("Error removing item from cart", err);
    }
  };

  // Function to handle the checkout process
  const handleCheckout = async () => {
    try {
      const transactionId = new Date().getTime().toString();  // Generate a unique transaction ID based on the timestamp
      const formatDateForMySQL = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
      const purchaseDate = new Date();

      // Ship date is 14 days after purchase date
      const shipDate = new Date(purchaseDate);
      shipDate.setDate(shipDate.getDate() + 14);

      const updatedCartItems = await Promise.all(cartItems.map(async (item) => {
        const productResponse = await axios.get(`http://localhost:8800/products/${item.id}`);
        const product = productResponse.data;
        return { ...item, category: product.category };
      }));

      const orderData = {
        user_id: userId,
        customer_name: customerName,
        customer_address: isHomeDelivery ? customerAddress : null,
        credit_card_number: creditCard,
        purchase_date: formatDateForMySQL(purchaseDate),
        ship_date: isHomeDelivery ? formatDateForMySQL(shipDate) : null,
        products: updatedCartItems.map(item => ({
          id: item.id,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_cost: isHomeDelivery ? 10.00 : null,
        discount: 0.00,
        total_sales: totalPrice + (isHomeDelivery ? 10.00 : 0),
        store_id: isHomeDelivery ? null : selectedStore?.store_id,  // Ensure correct store_id is passed
        store_address: isHomeDelivery ? null : `${selectedStore?.street}, ${selectedStore?.city}, ${selectedStore?.state}, ${selectedStore?.zip_code}`,  // Ensure full store address is passed
        transaction_id: transactionId
      };

      console.log("Order Data: ", orderData);  // Log the orderData to verify

      const response = await axios.post('http://localhost:8800/orders', orderData);
      if (response.status === 200) {
        const generatedOrderId = response.data.order_id;
        await axios.delete(`http://localhost:8800/cart/${userId}`);
        alert(`Order placed successfully! Your order ID is: ${generatedOrderId}`);
        setCartItems([]);  // Clear cart in frontend state
      }
    } catch (err) {
      console.error("Error placing order", err);
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length > 0 ? (
        <ul className="cart-items">
          {cartItems.map((item, index) => (
            <li key={`${item.id}-${index}`} className="cart-item">  {/* Unique key added */} 
              <img src={`http://localhost:8800/${item.image}`} alt={item.name} />
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>Price: ${item.price}</p>
                <div className="cart-item-quantity">
                  <p>Quantity: {item.quantity}</p>
                </div>
                <button className="remove-button" onClick={() => handleRemoveFromCart(item.id)}>Remove from Cart</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-cart-message">Your cart is empty.</p>
      )}

      <div className="checkout-form">
        <h3>Checkout Details</h3>

        <label>
          Customer Name:
          <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </label>

        <div className="delivery-toggle">
          <label>
            <input
              type="radio"
              value="homeDelivery"
              checked={isHomeDelivery}
              onChange={() => setIsHomeDelivery(true)}
            />
            Home Delivery
          </label>
          <label>
            <input
              type="radio"
              value="inStorePickup"
              checked={!isHomeDelivery}
              onChange={() => setIsHomeDelivery(false)}
            />
            In-Store Pickup
          </label>
        </div>

        {isHomeDelivery ? (
          <label>
            Shipping Address:
            <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
          </label>
        ) : (
          <label>
            Select Pickup Location:
            <select
              value={selectedStore?.store_id || ""}  // Bind the value to selectedStore's store_id or empty if not selected
              onChange={(e) => {
                const selectedStoreId = parseInt(e.target.value);  // Get the selected store ID from dropdown
                const store = stores.find(store => store.store_id === selectedStoreId);
                setSelectedStore(store);  // Update the selectedStore state with the selected store
              }}
            >
              <option value="">Select Store</option>  {/* Default option */}
              {stores.map((store) => (
                <option key={store.store_id} value={store.store_id}>  {/* Use store.store_id for key and value */}
                  {store.street}, {store.city}, {store.state}, {store.zip_code}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Credit Card Number:
          <input type="text" value={creditCard} onChange={(e) => setCreditCard(e.target.value)} />
        </label>

        <button className="checkout-button" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>

      <div className="cart-summary">
        <h3>Total: ${totalPrice.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default Cart;
