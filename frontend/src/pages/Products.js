import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [editProduct, setEditProduct] = useState(null); // For handling updates
    const navigate = useNavigate();
    const editFormRef = useRef(null);
    // Fetch all products when the component mounts
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:8800/all-products');  // Fetch all products
                setProducts(response.data);
            } catch (err) {
                console.error('Error fetching products', err);
            }
        };

        fetchProducts();
    }, []);

    // Function to handle deleting a product
    const handleDelete = async (productId) => {
        try {
            await axios.delete(`http://localhost:8800/products/${productId}`);  // Delete product by ID
            setProducts(products.filter(product => product.id !== productId));  // Remove from frontend state
        } catch (err) {
            console.error('Error deleting product', err);
        }
    };

    // Function to handle editing a product (pre-fill form)
    const handleEdit = (product) => {
        setEditProduct(product); // Set the selected product to edit
        
        if (editFormRef.current) {
            editFormRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Function to handle updating a product
    const handleUpdate = async (productId) => {
        try {
            const response = await axios.put(`http://localhost:8800/products/${productId}`, editProduct);
            console.log('Product updated successfully:', response.data);
            setProducts(products.map(p => (p.id === productId ? editProduct : p)));  // Update frontend state
            setEditProduct(null); // Clear the edit state
        } catch (err) {
            console.error('Error updating product', err);
        }
    };

    // Handle change in input fields for editing product
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProduct({ ...editProduct, [name]: value });
    };
    const handleAddProduct = () => {
        navigate('/add-product');  // Redirect to AddProducts.js
    };

    return (
        <div className="products-container">
            <h2>Product List</h2>
            <button onClick={handleAddProduct}>Add Product</button>
            <ul>
                {products.map(product => (
                    <li key={product.id} className="product-card">
                        <img src={`http://localhost:8800/${product.image}`} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>Price: ${product.price}</p>
                        <p>Description: {product.description}</p>
                        <button onClick={() => handleDelete(product.id)} className="delete-button">Delete</button>
                        <button onClick={() => handleEdit(product)} className="edit-button">Edit</button>
                    </li>
                ))}
            </ul>

            {/* Edit Product Form */}
            {editProduct && (
                <div className="edit-product-form" ref={editFormRef}>
                    <h3>Edit Product</h3>
                    <label>
                        Name:
                        <input 
                            type="text" 
                            name="name" 
                            value={editProduct.name} 
                            onChange={handleInputChange} 
                        />
                    </label>
                    <label>
                        Price:
                        <input 
                            type="number" 
                            name="price" 
                            value={editProduct.price} 
                            onChange={handleInputChange} 
                        />
                    </label>
                    <label>
                        Description:
                        <input 
                            type="text" 
                            name="description" 
                            value={editProduct.description} 
                            onChange={handleInputChange} 
                        />
                    </label>
                    <button onClick={() => handleUpdate(editProduct.id)} className="update-button">Update Product</button>
                    <button onClick={() => setEditProduct(null)} className="cancel-button">Cancel</button>
                </div>
            )}
        </div>
    );
};

export default Products;
