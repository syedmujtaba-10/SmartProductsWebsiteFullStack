import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'

const Login = () => {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('StoreManager');  // Default role
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:8800/login', {
                username: user,
                password: password,
                role: role
            });

            console.log('Login successful!', response.data);  // Log the entire response to check for user_id and role

            // Ensure correct role check
            if (response.data.role === 'StoreManager') {
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('userId', response.data.user_id);  // Store the user ID in localStorage
                localStorage.setItem('role', response.data.role);       // Store the role in localStorage
                navigate('/products');  // Redirect Store Manager to products page
            } else if(response.data.role === 'Salesmen'){
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('userId', response.data.user_id);  // Store the user ID in localStorage
                localStorage.setItem('role', response.data.role);       // Store the role in localStorage
                navigate('/manage-orders');

            } 
            else {
                localStorage.setItem('isLoggedIn', true);   // Save login state
                localStorage.setItem('userId', response.data.user_id);  // Save user ID
                navigate('/');  // Redirect to home or another page for other roles
            }

        } catch (err) {
            console.error('Error during login', err);  // Log any errors during login
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:8800/register', {
                username: user,
                password: password,
                role: role
            });
            console.log('Registration Successful!', response.data);
            window.location.reload();
        } catch (err) {
            console.error('Error during registration', err);
        }
    };

    const handleCreateAccount = () => {
        navigate('/register');  // Redirect to register page
    };

    return (
        <div className="login-page-container">
            <div className="login-form">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="login-form-group">
                        <label className="login-label" htmlFor='username'>Username</label>
                        <input 
                            type='text' 
                            className="login-input" 
                            placeholder='Enter Username' 
                            value={user} 
                            onChange={e => setUser(e.target.value)} 
                        />
                    </div>
                    <div className="login-form-group">
                        <label className="login-label" htmlFor='password'>Password</label>
                        <input 
                            type='password' 
                            className="login-input" 
                            placeholder='Enter Password' 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>
                    <div className="login-form-group">
                        <label className="login-label" htmlFor='role'>Select Role</label>
                        <select 
                            className="login-select" 
                            value={role} 
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="StoreManager">Store Manager</option>
                            <option value="Customers">Customers</option>
                            <option value="Salesmen">Salesmen</option>
                        </select>
                    </div>
                    <div className="login-form-buttons">
                        <button type='button' className="login-button" onClick={handleLogin}>Login</button>
                        <button type='button' className="login-button" onClick={handleRegister}>Register</button>
                        <button type="button" className="login-button login-create-account-button" onClick={handleCreateAccount}>Create an Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
