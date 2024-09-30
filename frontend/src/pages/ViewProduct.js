import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ViewProduct.css';
import NavBar from './NavBar';

const ViewProduct = () => {
  const { id } = useParams();  // Get the product ID from the URL params
  const [product, setProduct] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [reviews, setReviews] = useState([]); // State to store product reviews
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');  // Get logged-in user ID from localStorage

  // Fetch product, accessories, and reviews data
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch product details
        const productResponse = await axios.get(`http://localhost:8800/products/${id}`);
        setProduct(productResponse.data);

        // Fetch associated accessories for the product
        const accessoriesResponse = await axios.get(`http://localhost:8800/accessories?product_id=${id}`);
        setAccessories(accessoriesResponse.data);

        // Fetch reviews for the product using the product's model name
        const reviewsResponse = await axios.get(`http://localhost:8800/productreview/${productResponse.data.name}`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        setError("Error fetching product, accessories, or reviews");
        console.error("Error fetching product, accessories, or reviews", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  // Add product/accessory to cart
  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await axios.post('http://localhost:8800/cart', {
        user_id: userId,
        product_id: productId,  // This could be either a product or an accessory ID
        quantity
      });
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart', error);
      setError("Error adding to cart");
    }
  };

  // Navigate to review form
  const handleWriteReview = () => {
    console.log(product)
    // Navigate to the review form and pass the product details as state
    navigate(`/review-form/${id}`, { state: { product } });
  };

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <NavBar />
      <div className="view-product-container">
        {product ? (
          <div className="product-details">
            <h2>{product.name}</h2>
            <img src={`http://localhost:8800/${product.image}`} alt={product.name} />
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> ${product.price}</p>
            <button onClick={() => handleAddToCart(product.id)}>Add to Cart</button> {/* Add product to cart */}
            <button onClick={handleWriteReview}>Write a Review</button>

            <h3>Accessories</h3>
            {accessories.length > 0 ? (
              <ul>
                {accessories.map(accessory => (
                  <li key={accessory.id}>
                    <img src={`http://localhost:8800/${accessory.image}`} alt={accessory.name} />
                    <p><strong>{accessory.name}</strong> - ${accessory.price}</p>
                    <button onClick={() => handleAddToCart(accessory.id)}>Add Accessory to Cart</button> {/* Add accessory to cart */}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No accessories available for this product.</p>
            )}

            {/* Product Reviews Section */}
            <h3>Product Reviews</h3>
            {reviews.length > 0 ? (
              <ul className="product-reviews">
                {reviews.map(review => (
                  <li key={review._id} className="review-item">
                    <p><strong>User:</strong> {review.UserID}</p>
                    <p><strong>Rating:</strong> {review.ReviewRating}/5</p>
                    <p><strong>Review Date:</strong> {review.ReviewDate}</p>
                    <p><strong>Review:</strong> {review.ReviewText}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet. Be the first to write a review!</p>
            )}

          </div>
        ) : (
          <p>Loading product details...</p>
        )}
      </div>
    </div>
  );
};

export default ViewProduct;
