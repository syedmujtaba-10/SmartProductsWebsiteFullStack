import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateOrder = () => {
    const { id } = useParams();  // Use 'id' now
    const [orderData, setOrderData] = useState({});
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [creditCard, setCreditCard] = useState('');
    const [deliveryType, setDeliveryType] = useState('home');
    const navigate = useNavigate();

    // Fetch order details for the given id
    useEffect(() => {
        const fetchOrderData = async () => {
            try {
                const response = await axios.get(`http://localhost:8800/order-products/${id}`);
                const data = response.data;
                setOrderData(data);
                setSelectedProduct(data.product_id);
                setQuantity(data.quantity);
                setTotalSales(data.total_sales);
                setCustomerName(data.customer_name);
                setCustomerAddress(data.customer_address);
                setCreditCard(data.credit_card_number);
                setDeliveryType(data.delivery_type);
            } catch (err) {
                console.error('Error fetching order data:', err);
            }
        };

        fetchOrderData();
    }, [id]);

    // Fetch available products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8800/all-products');
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products', err);
            }
        };

        fetchProducts();
    }, []);

    // Handle order update
    const handleUpdateOrder = async () => {
        try {
            await axios.put(`http://localhost:8800/order-products/${id}`, {
                product_id: selectedProduct,
                customer_name: customerName,
                quantity: quantity,
                total_sales: totalSales,
                customer_address: customerAddress,
                credit_card_number: creditCard,
                delivery_type: deliveryType
            });

            alert('Order updated successfully!');
            navigate('/manage-orders');
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    return (
        <div>
            <h2>Update Order</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateOrder();
            }}>
                <div>
                    <label>Order ID:</label>
                    <p>{orderData.order_id}</p> {/* Show Order ID */}
                </div>
                <div>
                    <label>Product ID:</label>
                    <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required>
                        <option value="">Select Product</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Customer Name:</label>
                    <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={(e) => setQuantity(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Total Sales:</label>
                    <input 
                        type="number" 
                        value={totalSales} 
                        onChange={(e) => setTotalSales(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Customer Address:</label>
                    <input 
                        type="text" 
                        value={customerAddress} 
                        onChange={(e) => setCustomerAddress(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Credit Card Number:</label>
                    <input 
                        type="text" 
                        value={creditCard} 
                        onChange={(e) => setCreditCard(e.target.value)} 
                        required 
                    />
                </div>
                
                <button type="submit">Update Order</button>
            </form>
        </div>
    );
};

export default UpdateOrder;
