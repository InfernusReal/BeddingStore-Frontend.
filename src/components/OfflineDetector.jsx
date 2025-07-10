import React, { useState, useEffect } from 'react';
import './OfflineDetector.css';

function OfflineDetector({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Additional check using fetch to verify actual connectivity
    const checkConnectivity = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    // Check connectivity every 10 seconds
    const intervalId = setInterval(checkConnectivity, 10000);

    // Initial connectivity check
    checkConnectivity();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="offline-screen">
        <div className="offline-container">
          <div className="offline-content">
            <h1 className="offline-title">No Internet Access</h1>
            <p className="offline-message">
              Please check your internet connection and try again
            </p>
            <div className="offline-spinner">
              <div className="spinner"></div>
            </div>
            <p className="offline-retry">Checking connection...</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default OfflineDetector;
