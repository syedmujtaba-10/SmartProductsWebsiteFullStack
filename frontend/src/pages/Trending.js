import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Trending.css'; // Include some basic styling

const Trending = () => {
  const [mostLikedProducts, setMostLikedProducts] = useState([]);
  const [topZipCodes, setTopZipCodes] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);

  useEffect(() => {
    // Fetch the most liked products
    const fetchMostLikedProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8800/trending/most-liked');
        setMostLikedProducts(response.data);
      } catch (error) {
        console.error('Error fetching most liked products:', error);
      }
    };

    // Fetch the top zip codes by sales
    const fetchTopZipCodes = async () => {
      try {
        const response = await axios.get('http://localhost:8800/trending/top-zip-codes');
        setTopZipCodes(response.data);
      } catch (error) {
        console.error('Error fetching top zip codes:', error);
      }
    };

    // Fetch the most sold products with details
    const fetchMostSoldProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8800/trending/most-sold-products');
        setMostSoldProducts(response.data);
      } catch (error) {
        console.error('Error fetching most sold products:', error);
      }
    };

    fetchMostLikedProducts();
    fetchTopZipCodes();
    fetchMostSoldProducts();
  }, []);

  return (
    <div className="trending-container">
      <h2>Trending Products and Sales Insights</h2>

      {/* Most Liked Products */}
      <div className="trending-section">
        <h3>Top 5 Most Liked Products</h3>
        <ul>
          {mostLikedProducts.map((product, index) => (
            <li key={index}>
              <strong>{product._id}</strong>: {product.count} reviews
            </li>
          ))}
        </ul>
      </div>

      {/* Top Zip Codes by Sales */}
      <div className="trending-section">
        <h3>Top 5 Zip Codes with Maximum Sales</h3>
        <ul>
          {topZipCodes.map((zip, index) => (
            <li key={index}>
              <strong>{zip.zip_code}</strong>: {zip.count} products sold
            </li>
          ))}
        </ul>
      </div>

      {/* Most Sold Products with Product Details */}
      <div className="trending-section">
        <h3>Top 5 Most Sold Products</h3>
        <ul className="most-sold-products">
          {mostSoldProducts.map((product, index) => (
            <li key={index}>
              <div className="product-details">
                <img src={`http://localhost:8800/${product.image}`} alt={product.name} className="product-image" />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p><strong>Price:</strong> ${product.price}</p>
                  <p><strong>Quantity Sold:</strong> {product.count}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Trending;
