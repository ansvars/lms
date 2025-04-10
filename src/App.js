import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import UserPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import TestPage from './pages/TestPage/TestPage'; // Make sure this path is correct
import './App.css';

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [token, location.pathname, navigate]);

  return (
    <div className="app">
      {location.pathname !== '/login' && <Sidebar />}
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={token ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/users"
            element={token ? <UserPage /> : <Navigate to="/login" replace />}
          />
          {/* Add TestPage route with the same auth protection */}
          <Route
            path="/tests"
            element={token ? <TestPage /> : <Navigate to="/login" replace />}
          />
          {/* Add other protected routes below */}
        </Routes>
      </div>
    </div>
  );
};

export default App;