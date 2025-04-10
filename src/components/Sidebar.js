import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({
    name: 'User Name',
    email: 'user@example.com'
  });

  // Fetch user data on component mount
  useEffect(() => {
    // Method 1: Get from localStorage (recommended if you store user data there)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setCurrentUser({
          name: parsedData.name || 'User Name',
          email: parsedData.email || 'user@example.com'
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Method 2: Uncomment if you prefer to fetch from API
    /*
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setCurrentUser({
          name: data.name || data.username || 'User',
          email: data.email || 'user@example.com'
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
    */
  }, []);

  const sidebarItems = [
    { name: 'Home', path: '/' },
    { name: 'Users', path: '/users' },
    { name: 'Tests', path: '/tests' },
    { name: 'Categories', path: '/categories' },
    { name: 'Groups', path: '/groups' },
    { name: 'Branches', path: '/branches' },
    { name: 'User Types', path: '/user-types' },
    { name: 'Events Engine', path: '/events-engine' },
    { name: 'Import - Export', path: '/import-export' },
    { name: 'Reports', path: '/reports' },
    { name: 'Account & Settings', path: '/settings' }
  ];

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
    // Optional: Refresh the page to clear any state
    window.location.reload();
  };

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="user-profile-card">
        <div className="user-avatar">
          {currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </div>
        <div className="user-info">
          <h3 className="user-name">{currentUser.name}</h3>
          <p className="user-email">{currentUser.email}</p>
        </div>
      </div>

      {/* Navigation Items - Maintained exactly as before */}
      <div className="sidebar-items">
        {sidebarItems.map(item => (
          <button
            key={item.name}
            className="sidebar-item"
            onClick={() => navigate(item.path)}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Logout Button - Same functionality, better visual */}
      <button className="logout-btn" onClick={handleLogout}>
        <span className="logout-icon">→</span> Logout
      </button>
    </div>
  );
};

export default Sidebar;