import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ManageOrder.css';

const ManageOrder = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState({}); // To store product details
    const navigate = useNavigate();

    // Fetch all orders from order_products table
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8800/orders-products');
                setOrders(response.data);

                // Fetch product details for each order
                response.data.forEach(order => {
                    fetchProductDetails(order.product_id); // Fetch product details using product_id
                });
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();
    }, []);

    // Function to fetch product details
    const fetchProductDetails = async (productId) => {
        try {
            const response = await axios.get(`http://localhost:8800/products/${productId}`);
            setProducts(prevProducts => ({
                ...prevProducts,
                [productId]: response.data  // Store product details keyed by product_id
            }));
        } catch (err) {
            console.error(`Error fetching product details for product ID ${productId}:`, err);
        }
    };

    // Handle delete order from order_products table
    const handleDeleteOrder = async (id) => {
        try {
            // Step 1: Fetch the order_id associated with the product 'id' in order_products
            const response = await axios.get(`http://localhost:8800/order-products/${id}`);
            const { order_id } = response.data;
    
            // Store the order_id if you need to use it later (e.g., for additional operations)
            console.log("Associated order_id:", order_id);
    
            // Step 2: Delete the entry from order_products by 'id'
            await axios.delete(`http://localhost:8800/order-products/${id}`);
    
            // Step 3: Update the UI after successful deletion
            const updatedOrders = orders.filter(order => order.id !== id);
            setOrders(updatedOrders);
    
            console.log("Product deleted successfully.");
        } catch (err) {
            console.error('Error deleting order:', err);
        }
    };

    // Handle update order (navigate to UpdateOrder.js)
    const handleUpdateOrder = (id) => {
        navigate(`/update-order/${id}`);  // Navigate using id (since we use id now in UpdateOrder.js)
    };

    return (
        <div className="manage-orders-container">
            <h2>Manage Orders</h2>
            <button onClick={() => navigate('/add-order')}>Add Order</button>
            <button onClick={() => navigate('/register')}>Create Account</button>
            {orders.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Order ID</th>
                            <th>Product Image</th>
                            <th>Product Name</th>
                            <th>Product ID</th>
                            <th>Customer Name</th>
                            <th>Quantity</th>
                            <th>Total Sales</th>
                            <th>Customer Address</th>
                            <th>Credit Card</th>
                            <th>Store Address</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const product = products[order.product_id]; // Get the product details for the current product_id

                            return (
                                <tr key={order.id}>
                                    <td>{order.id}</td>  {/* Use id from order_products */}
                                    <td>{order.order_id}</td>
                                    <td>
                                        {product && (
                                            <img
                                                src={`http://localhost:8800/${product.image}`} 
                                                alt={product.name} 
                                                style={{ width: '50px', height: '50px' }} 
                                            />
                                        )}
                                    </td>
                                    <td>{product ? product.name : 'Loading...'}</td>
                                    <td>{order.product_id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{order.quantity}</td>
                                    <td>${order.total_sales}</td>
                                    <td>{order.customer_address}</td>
                                    <td>{order.credit_card_number}</td>
                                    <td>{order.store_address}</td>
                                    <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleUpdateOrder(order.id)}>  {/* Pass id */}
                                            Update
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDeleteOrder(order.id)}>  {/* Pass id */}
                                            Delete
                                        </button>
                                    </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>No orders available.</p>
            )}
        </div>
    );
};

export default ManageOrder;
