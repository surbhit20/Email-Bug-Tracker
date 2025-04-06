import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-container">
        <h1 className="app-title">Samsung</h1>
        
        <nav className="app-nav">
          <Link 
            to="/bugs" 
            className={`nav-link ${location.pathname === '/bugs' ? 'active' : ''}`}
          >
            Bug List
          </Link>
          <Link 
            to="/bug_modifications" 
            className={`nav-link ${location.pathname === '/bug_modifications' ? 'active' : ''}`}
          >
            Bug Modifications
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 