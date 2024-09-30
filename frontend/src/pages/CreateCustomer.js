import React, { useState } from 'react';
import axios from 'axios';

const CreateCustomer = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');

    const handleCreateCustomer = async () => {
        try {
            await axios.post('http://localhost:8800/salesman/customers', {
                username,
                password,
                customer_name: customerName,
                street,
                city,
                state,
                zip_code: zipCode
            });
            alert('Customer created successfully');
        } catch (err) {
            console.error('Error creating customer', err);
        }
    };

    return (
        <div>
            <h2>Create Customer</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateCustomer();
            }}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div>
                    <label>Customer Name:</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>
                <div>
                    <label>Street:</label>
                    <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />
                </div>
                <div>
                    <label>City:</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div>
                    <label>State:</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />
                </div>
                <div>
                    <label>Zip Code:</label>
                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                </div>
                <button type="submit">Create Customer</button>
            </form>
        </div>
    );
};

export default CreateCustomer;
