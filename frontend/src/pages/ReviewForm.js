import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';  // To get the product details passed from ViewProduct

const ReviewForm = () => {
  const location = useLocation();
  const { product } = location.state;  // Get product details from location state

  const [reviewRating, setReviewRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userOccupation, setUserOccupation] = useState('');
  const [manufacturerName, setManufacturerName] = useState(product.manufacturer || '');  // Allow user to input ManufacturerName
  const [manufacturerRebate, setManufacturerRebate] = useState('No');  // User chooses ManufacturerRebate
  const userId = localStorage.getItem('userId');  // Get logged-in user ID from localStorage
  const [userDetails, setUserDetails] = useState({});  // Fetch additional user details if needed

  const [stores, setStores] = useState([]);  // List of stores from MySQL
  const [selectedStore, setSelectedStore] = useState(null);  // Selected store object
  const navigate = useNavigate();

  // Fetch user details from MySQL based on userId
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8800/customers/${userId}`);
        setUserDetails(response.data);  // Set user details
      } catch (error) {
        console.error("Error fetching user details", error);
      }
    };

    const fetchStores = async () => {
      try {
        const storeResponse = await axios.get('http://localhost:8800/stores');
        setStores(storeResponse.data);  // Set the fetched stores
      } catch (error) {
        console.error("Error fetching stores", error);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
    fetchStores();  // Fetch stores when the component mounts
  }, [userId]);

  // Handle store selection from the dropdown
  const handleStoreSelect = (e) => {
    const storeId = e.target.value;
    const store = stores.find(s => s.store_id === parseInt(storeId));
    if (store) {
      setSelectedStore(store);  // Set the selected store
    }
  };

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const reviewData = {
      ProductModelName: product.name,
      ProductCategory: product.category,
      ProductPrice: `$${product.price}`, // Add the $ symbol as expected
      StoreID: selectedStore ? selectedStore.store_id : '',
      StoreZip: selectedStore ? selectedStore.zip_code : '',
      StoreCity: selectedStore ? selectedStore.city : '',
      StoreState: selectedStore ? selectedStore.state : '',
      ProductOnSale: product.on_sale ? true : false,  // Use boolean true/false
      ManufacturerName: "Smart Products",
      ManufacturerRebate: manufacturerRebate === 'Yes' ? true : false,  // Convert to boolean
      UserID: userId,
      UserAge: parseInt(userAge, 10),  // Convert to integer
      UserGender: userGender,
      UserOccupation: userOccupation,
      ReviewRating: parseInt(reviewRating, 10),  // Convert to integer
      ReviewDate: new Date().toLocaleDateString('en-US'),  // Ensure proper date format
      ReviewText: reviewText,
    };

    console.log('Review Data being sent to the server:', reviewData);

    try {
      await axios.post('http://localhost:8800/productreview', reviewData);  // Submit to MongoDB
      alert('Review submitted successfully!');
      navigate(`/view-product/${product.id}`);
    } catch (error) {
      console.error("Error submitting review", error);
    }
  };

  return (
    <div className="review-form-container">
      <h2>Write a Review for {product.name}</h2>
      <form onSubmit={handleSubmitReview}>
        {/* Automatically populated fields shown in the form */}
        <div>
          <label>Product Model Name:</label>
          <input type="text" value={product.name} readOnly />
        </div>
        <div>
          <label>Product Category:</label>
          <input type="text" value={product.category} readOnly />
        </div>
        <div>
          <label>Product Price:</label>
          <input type="text" value={`$${product.price}`} readOnly />
        </div>

        {/* Dropdown to select store */}
        <div>
          <label>Select Store:</label>
          <select onChange={handleStoreSelect} required>
            <option value="">Select Store</option>
            {stores.map(store => (
              <option key={store.store_id} value={store.store_id}>
                {store.street}, {store.city}, {store.state} - {store.zip_code}
              </option>
            ))}
          </select>
        </div>

        {/* Automatically populated store fields */}
        <div>
          <label>Store City:</label>
          <input type="text" value={selectedStore ? selectedStore.city : ''} readOnly />
        </div>
        <div>
          <label>Store State:</label>
          <input type="text" value={selectedStore ? selectedStore.state : ''} readOnly />
        </div>
        <div>
          <label>Store Zip:</label>
          <input type="text" value={selectedStore ? selectedStore.zip_code : ''} readOnly />
        </div>

        {/* Other fields that the user must fill */}
        <div>
          <label>Manufacturer Name:</label>
          <input
            type="text"
            value="Smart Products"
            onChange={(e) => setManufacturerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Manufacturer Rebate:</label>
          <select value={manufacturerRebate} onChange={(e) => setManufacturerRebate(e.target.value)} required>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={userAge}
            onChange={(e) => setUserAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Gender:</label>
          <select value={userGender} onChange={(e) => setUserGender(e.target.value)} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Occupation:</label>
          <input
            type="text"
            value={userOccupation}
            onChange={(e) => setUserOccupation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Rating:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={reviewRating}
            onChange={(e) => setReviewRating(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          />
        </div>

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
};

export default ReviewForm;
