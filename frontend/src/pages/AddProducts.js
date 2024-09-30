import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProducts.css';

const AddProducts = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePath, setImagePath] = useState('');  // Image path input instead of file upload
    const [category, setCategory] = useState('');
    const navigate = useNavigate();

    // Function to handle adding a product
    const handleAddProduct = async () => {
        try {
            // Send product details including image path to the backend
            const response = await axios.post('http://localhost:8800/products', {
                name: name,
                price: price,
                description: description,
                image: imagePath,  // Send image path instead of file
                category: category
            });

            alert('Product added successfully!');
            navigate('/products');  // Redirect to products page after adding the product
        } catch (err) {
            console.error('Error adding product', err);
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add Product</h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                handleAddProduct();
            }}>
                <div>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Price:</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                    <label>Description:</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                    <label>Category:</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        <option value="">Select Category</option>
                        <option value="Smart Doorbells">Smart Doorbells</option>
                        <option value="Smart Doorlocks">Smart Doorlocks</option>
                        <option value="Smart Speakers">Smart Speakers</option>
                        <option value="Smart Lightings">Smart Lightings</option>
                        <option value="Smart Thermostats">Smart Thermostats</option>
                    </select>
                </div>
                <div>
                    <label>Image Path:</label>
                    <input 
                        type="text" 
                        value={imagePath} 
                        placeholder="Enter image path (e.g., /images/products/doorbell.jpg)" 
                        onChange={(e) => setImagePath(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProducts;
