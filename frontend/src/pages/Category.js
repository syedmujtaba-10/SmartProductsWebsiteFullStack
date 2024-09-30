import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from './NavBar';  // Import the NavBar component
import './Category.css';
import { useParams, useNavigate } from 'react-router-dom'; // Use useNavigate to redirect

const Category = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();  // To redirect users
  const userId = localStorage.getItem('userId'); // Get userId from local storage

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/products?category=${category}`);
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };

    fetchProducts();
  }, [category]);

  const handleAddToCart = async (product_id) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');  // Check if user is logged in

    if (!isLoggedIn) {
      // If user is not logged in, redirect to login page
      navigate('/login');
    } else {
      try {
        // Add product to cart if logged in
        await axios.post('http://localhost:8800/cart', {
          user_id: userId,
          product_id: product_id,
          quantity: 1
        });
        alert('Product added to cart!');
      } catch (error) {
        console.error("Error adding to cart", error);
      }
    }
  };

  const handleViewProduct = (product_id) => {
    navigate(`/view-product/${product_id}`);  // Redirect to ViewProduct.js with product id
  };

  return (
    <div className="category-container">
      <NavBar />

      <div className="product-content">
        <h2>{category} Products</h2>
        <div className="product-list">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="product-card">
                <img src={`http://localhost:8800/${product.image}`} alt={product.name} />
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>Price: ${product.price}</p>
                <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button>
                <button onClick={() => handleViewProduct(product.id)}>View</button> {/* New View Button */}
              </div>
            ))
          ) : (
            <p>No products available in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
