import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../index.css";
import "./NavBar.css";

const NavBar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved mode, default to dark mode
    const saved = localStorage.getItem("darkMode");
    return saved === "false" ? false : true; // Default to dark mode
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isSlugRoute = /^\/product\//.test(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    // Close sidebar when changing routes
    setSidebarOpen(false);
  }, [location]);

  // Add body scroll lock when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleToggle = () => {
    setDarkMode((prev) => !prev);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <nav className={`navbar${darkMode ? " dark" : ""}${isSlugRoute ? " slug-dark" : ""}`}> 
      <div className="navbar-logo">
        <span className="navbar-title pacifico-regular">The Bedding Store</span>
      </div>

      {/* Hamburger Menu for Mobile - with open class for animation */}
      <div className={`navbar-hamburger${sidebarOpen ? " open" : ""}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar Overlay - only visible when sidebar is open */}
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={toggleSidebar}></div>

      {/* Navigation Links - will become sidebar on mobile */}
      <ul className={`navbar-links${sidebarOpen ? " open" : ""}`}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/announcements">Announcements</Link></li>
      </ul>
      
      <div className="navbar-actions">
        <Link to="/cart" className="addtocart-btn" aria-label="Add to Cart">
          <img src="/add_shopping_cart_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg" alt="Add to Cart" />
        </Link>
        {/* Remove dark/light mode toggle button on AdminSettings route */}
        {location.pathname !== '/admin/settings' && !isSlugRoute && (
          <button className="mode-toggle" onClick={handleToggle} aria-label="Toggle dark mode">
            {darkMode ? (
              <img src="/light_mode_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Light Mode" />
            ) : (
              <img src="/dark_mode_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="Dark Mode" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
