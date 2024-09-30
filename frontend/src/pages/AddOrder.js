import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddOrder.css';

const AddOrder = () => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [creditCard, setCreditCard] = useState('');
    const [isHomeDelivery, setIsHomeDelivery] = useState(true);
    const [selectedStore, setSelectedStore] = useState(null);
    const [stores, setStores] = useState([]);
    const [quantity, setQuantity] = useState(1); // Default quantity to 1
    const [totalSales, setTotalSales] = useState(0);
    const [shippingCost, setShippingCost] = useState(10); // Default shipping cost
    const navigate = useNavigate();

    // Fetch customers to populate the dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:8800/customers');
                setCustomers(response.data);
            } catch (err) {
                console.error('Error fetching customers', err);
            }
        };
        fetchCustomers();
    }, []);

    // Fetch products to populate the dropdown
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

    // Fetch stores if in-store pickup is selected
    useEffect(() => {
        if (!isHomeDelivery) {
            const fetchStores = async () => {
                try {
                    const response = await axios.get('http://localhost:8800/stores');
                    setStores(response.data);
                } catch (error) {
                    console.error('Error fetching stores', error);
                }
            };
            fetchStores();
        }
    }, [isHomeDelivery]);

    // Handle customer selection
    const handleCustomerChange = (e) => {
        const customerId = parseInt(e.target.value);
        const customer = customers.find(cust => cust.user_id === customerId);
        if (customer) {
            setSelectedCustomer(customer);
        }
    };

    // Handle product selection
    const handleProductChange = (e) => {
        const selectedProductId = parseInt(e.target.value);
        const product = products.find(prod => prod.id === selectedProductId);
        if (product) {
            setSelectedProduct(product);
            // Automatically calculate total sales based on product price and quantity
            setTotalSales(product.price * quantity);
        }
    };

    // Recalculate total sales when quantity changes
    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        setQuantity(newQuantity);
        if (selectedProduct) {
            setTotalSales(selectedProduct.price * newQuantity);
        }
    };

    // Handle order submission
    const handleAddOrder = async () => {
        const transactionId = new Date().getTime().toString(); // Generate unique transaction ID
        const purchaseDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format date for MySQL

        const orderData = {
            user_id: selectedCustomer.user_id,
            customer_name: selectedCustomer.customer_name,
            customer_address: isHomeDelivery ? `${selectedCustomer.street}, ${selectedCustomer.city}, ${selectedCustomer.state}, ${selectedCustomer.zip_code}` : null,
            credit_card_number: creditCard,
            purchase_date: purchaseDate,
            ship_date: isHomeDelivery ? purchaseDate : null,
            products: [{
                id: selectedProduct.id,
                category: selectedProduct.category,
                quantity: quantity,
                price: selectedProduct.price
            }],
            shipping_cost: isHomeDelivery ? shippingCost : null,
            discount: 0,
            total_sales: totalSales,
            store_id: isHomeDelivery ? null : selectedStore?.store_id,
            store_address: isHomeDelivery ? null : `${selectedStore?.street}, ${selectedStore?.city}, ${selectedStore?.state}, ${selectedStore?.zip_code}`,
            transaction_id: transactionId
        };

        try {
            const response = await axios.post('http://localhost:8800/orders', orderData);
            if (response.status === 200) {
                alert('Order added successfully!');
                navigate('/manage-orders'); // Redirect to orders page after successful addition
            }
        } catch (err) {
            console.error('Error adding order', err);
        }
    };

    return (
        <div className="add-order-container">
            <h2>Add Order</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleAddOrder();
            }}>
                {/* Select Customer */}
                <div>
                    <label>Select Customer:</label>
                    <select onChange={handleCustomerChange} required>
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                            <option key={customer.user_id} value={customer.user_id}>
                                {customer.customer_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Auto-populated Shipping Address */}
                {isHomeDelivery && selectedCustomer && (
                    <div>
                        <label>Shipping Address:</label>
                        <p>{`${selectedCustomer.street}, ${selectedCustomer.city}, ${selectedCustomer.state}, ${selectedCustomer.zip_code}`}</p>
                    </div>
                )}

                {/* Credit Card */}
                <div>
                    <label>Credit Card Number:</label>
                    <input 
                        type="text" 
                        value={creditCard} 
                        onChange={(e) => setCreditCard(e.target.value)} 
                        required 
                    />
                </div>

                {/* Delivery Type */}
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

                {/* In-Store Pickup */}
                {!isHomeDelivery && (
                    <div>
                        <label>Select Store:</label>
                        <select 
                            onChange={(e) => {
                                const selectedStoreId = parseInt(e.target.value);
                                const store = stores.find(store => store.store_id === selectedStoreId);
                                setSelectedStore(store);
                            }} 
                            required
                        >
                            <option value="">Select Store</option>
                            {stores.map((store) => (
                                <option key={store.store_id} value={store.store_id}>
                                    {store.street}, {store.city}, {store.state}, {store.zip_code}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Product Selection */}
                <div>
                    <label>Select Product:</label>
                    <select onChange={handleProductChange} required>
                        <option value="">Select Product</option>
                        {products.map(product => (
                            <option key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Quantity */}
                <div>
                    <label>Quantity:</label>
                    <input 
                        type="number" 
                        value={quantity} 
                        onChange={handleQuantityChange} 
                        required 
                    />
                </div>

                {/* Shipping Cost */}
                {isHomeDelivery && (
                    <div>
                        <label>Shipping Cost:</label>
                        <input 
                            type="number" 
                            value={shippingCost} 
                            onChange={(e) => setShippingCost(e.target.value)} 
                            required 
                        />
                    </div>
                )}

                {/* Total Sales */}
                <div>
                    <label>Total Sales:</label>
                    <input 
                        type="number" 
                        value={totalSales} 
                        readOnly 
                        required 
                    />
                </div>

                <button type="submit">Add Order</button>
            </form>
        </div>
    );
};

export default AddOrder;
