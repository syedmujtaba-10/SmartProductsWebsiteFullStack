import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';  // Optional CSS if you want to style it separately

const NavBar = () => {
  return (
    <nav className="nav-bar-left">
      <ul>
        <li><Link to="/category/Smart%20Doorbells">Smart Doorbells</Link></li>
        <li><Link to="/category/Smart%20Doorlocks">Smart Doorlocks</Link></li>
        <li><Link to="/category/Smart%20Speakers">Smart Speakers</Link></li>
        <li><Link to="/category/Smart%20Lightings">Smart Lightings</Link></li>
        <li><Link to="/category/Smart%20Thermostats">Smart Thermostats</Link></li>
        <li><Link to="/trending">Trending</Link></li>
      </ul>
    </nav>
  );
};

export default NavBar;
