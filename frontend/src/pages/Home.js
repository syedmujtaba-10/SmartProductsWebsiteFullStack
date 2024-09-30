import React from 'react';
import NavBar from './NavBar';  // Import the NavBar component
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Left Navigation Bar */}
      <NavBar />  {/* Include NavBar component */}

      {/* Center Content */}
      <div className="center-content">
        <h1>SmartStore</h1>
        <img src="/images/site/banner.jpg" alt="SmartStore Banner" className="banner-image" />
      </div>

      
    </div>
  );
};

export default Home;
