import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Customers');  // Default role set to Customers
    const [customerName, setCustomerName] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            // Register the user in the users table
            const response = await axios.post('http://localhost:8800/register', {
                username: username,
                password: password,
                role: role
            });
            
            console.log('User Registered Successfully!', response.data);
            const userId = response.data.user_id;  // Get the user_id from the response
            console.log('Received user ID:', userId);  // Log the user ID to verify

            // If the role is Customers, register additional information in the customers table
            if (role === 'Customers') {  // Use 'Customers' to match the role in the users table
                await axios.post('http://localhost:8800/customers', {
                    user_id: userId,
                    customer_name: customerName,
                    street: street,
                    city: city,
                    state: state,
                    zip_code: zipCode
                });
                console.log('Customer details added successfully!');
            }

            navigate('/login');  // Redirect to login after successful registration
        } catch (err) {
            console.log('Error during registration', err);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={(e) => {
                e.preventDefault();  // Prevent default form behavior
                handleRegister();
            }}>
                <div className="register-form-group">
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="register-form-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="register-form-group">
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="Customers">Customers</option>  {/* Set role as Customers */}
                        <option value="StoreManager">Store Manager</option>
                        <option value="Salesmen">Salesmen</option>
                    </select>
                </div>

                {/* Show additional fields only if role is Customers */}
                {role === 'Customers' && (
                    <div className="register-optional-fields">
                        <div className="register-form-group">
                            <label>Customer Name:</label>
                            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                        </div>
                        <div className="register-form-group">
                            <label>Street:</label>
                            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />
                        </div>
                        <div className="register-form-group">
                            <label>City:</label>
                            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                        </div>
                        <div className="register-form-group">
                            <label>State:</label>
                            <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />
                        </div>
                        <div className="register-form-group">
                            <label>Zip Code:</label>
                            <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
                        </div>
                    </div>
                )}

                <button type="submit" className="register-button">Register</button>
            </form>
        </div>
    );
};

export default Register;
