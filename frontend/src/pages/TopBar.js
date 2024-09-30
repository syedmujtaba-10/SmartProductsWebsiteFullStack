import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  // Handle logout by clearing the login state
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    navigate('/login');  // Redirect to login page
  };

  return (
    <div className="top-bar">
        <div className='top-bar-left'>
            <button><Link to="/">Home</Link></button>
        </div>
        <div className="top-bar-right">
            {isLoggedIn ? (
            <>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={() => navigate('/order-status')}>Order Status</button>  {/* New Order Status button */}
            </>
            ) : (
            <button onClick={() => navigate('/login')}>Login</button>
            )}
            <button onClick={() => navigate('/cart')}>Cart</button>
        </div>
    </div>
  );
};

export default TopBar;
