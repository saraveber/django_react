import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import "../styles/Navigation.css";

function Navigation() {
    // TODO: Rewiew of isAuthorized is needed 
    // When the user is logged in, the isAuthorized function returns true
    // In this code I have to refresh the page to see the changes
    const { isAuthorized } = useAuth();

    
    const location = useLocation();
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
      const shouldBeLoggedIn = location.pathname === '/' || location.pathname === '/my-terms';
      setLoggedIn(shouldBeLoggedIn);
    }, [location.pathname]);

    //console.log('Route changed to: ', location.pathname);
    //console.log('isAuthorized: ', isAuthorized);
    console.log('loggedIn: ', loggedIn);

    return (
        <nav className="nav-bar">
            <ul className="nav-list">
                {loggedIn ? (
                    <>
                      <li className="nav-item">
                          <Link to="/" className="nav-link">Home</Link>
                      </li>
                      <li className="nav-item">
                          <Link to="/my-terms" className="nav-link">MyTerms</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/logout" className="nav-link">Logout</Link>
                      </li>
                    </>
                ) : (
                    <>
                      <li className="nav-item">
                        <Link to="/login" className="nav-link">Login</Link>
                      </li>
                      <li className="nav-item">
                        <Link to="/register" className="nav-link">Register</Link>
                      </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navigation;