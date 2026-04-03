import React, { useState } from 'react';
import '../App.css';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (!isLogin && !formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user);
        } else {
          alert('Account created successfully. Please log in.');
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', name: '' });
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>
        <p className="login-subtitle">
          {isLogin ? 'Log in to manage your finances' : 'Create an account to start tracking your finances'}
        </p>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                className="input-field"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={loading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                className="input-field"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner">...</span> Loading...
              </span>
            ) : (
              <span className="btn-content">
                {isLogin ? 'Log In' : 'Create Account'}
              </span>
            )}
          </button>
        </form>

        <div className="quick-actions">
          <button className="quick-btn google-btn" onClick={() => alert('Google login coming soon.')}>
            Continue with Google
          </button>
          <button className="quick-btn facebook-btn" onClick={() => alert('Facebook login coming soon.')}>
            Continue with Facebook
          </button>
          <button className="quick-btn apple-btn" onClick={() => alert('Apple login coming soon.')}>
            Continue with Apple
          </button>
        </div>

        <div className="divider">
          <span>─ or ─</span>
        </div>

        <button 
          className="toggle-btn"
          onClick={toggleMode}
          disabled={loading}
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
        </button>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">Analytics</div>
            <div className="feature-text">Track Expenses</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">Insights</div>
            <div className="feature-text">AI Insights</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">Backup</div>
            <div className="feature-text">Excel Backup</div>
          </div>
        </div>

        <div className="login-footer">
          <p>Built for better finance management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;