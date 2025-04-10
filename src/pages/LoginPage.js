// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { socket } from '../services/socket';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Add this line
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', 'loggedin');
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/', { replace: true });
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setDialogMessage('Please contact support@convin.ai for password assistance');
    setShowDialog(true);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setDialogMessage('Please contact support@convin.ai to create an account');
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="brand-header">Convin LMS</h1>

        <div className="login-card">
          <h2 className="login-title">Sign in</h2>
          
          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSignIn} className="login-form">
            <div className="input-group">
              <label>Email Id*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password*</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="sign-in-button">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <a href="#" onClick={handleForgotPassword} className="forgot-password">Forgot Password?</a>
            <div className="divider">OR</div>
            <p className="sign-up-text">Don't have an account? <a href="#" onClick={handleSignUp}>Sign up now</a></p>
          </div>
        </div>
      </div>

      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog-box">
            <p>{dialogMessage}</p>
            <button onClick={closeDialog} className="dialog-button">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;