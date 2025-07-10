import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if device is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const adminToken = localStorage.getItem('adminDeviceToken');
      const tokenExpiry = localStorage.getItem('adminTokenExpiry');
      
      if (adminToken && tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();
        
        if (now < expiryDate) {
          setIsAuthenticated(true);
        } else {
          // Token expired, clear it
          localStorage.removeItem('adminDeviceToken');
          localStorage.removeItem('adminTokenExpiry');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (password) => {
    try {
      // Get user's IP address for logging
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIP = ipData.ip;

      // Send login request
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          ip: userIP,
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Generate device token (valid for 30 days)
        const deviceToken = generateDeviceToken();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        localStorage.setItem('adminDeviceToken', deviceToken);
        localStorage.setItem('adminTokenExpiry', expiryDate.toISOString());
        
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminDeviceToken');
    localStorage.removeItem('adminTokenExpiry');
    setIsAuthenticated(false);
  };

  const generateDeviceToken = () => {
    return 'admin_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
