import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Eye, EyeOff, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { authService } from '../../services/authService';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const navigate = useNavigate();

  // Check network connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isOnline) {
      setError('You are offline. Please check your internet connection.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Store user data and token
      onLogin(response.user, response.access_token);
      
      // Redirect to home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        if (status === 400 || status === 401) {
          setError(data.detail || 'Invalid email or password');
        } else if (status === 422) {
          setError('Please check your email format and try again.');
        } else if (status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(`Server error (${status}): Please try again later`);
        }
      } else if (error.request) {
        // Request was made but no response received
        setError('Server is not responding. Please try again later.');
      } else {
        // Other errors
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foxenfy-black via-foxenfy-dark to-foxenfy-gray-900 relative overflow-hidden">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            You are currently offline
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-foxenfy-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-foxenfy-secondary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-foxenfy-accent opacity-5 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative max-w-md w-full mx-6 z-10">
        <div className="auth-form p-8 animate-fade-in-up">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-foxenfy-primary opacity-20 rounded-2xl blur-xl"></div>
                <Music2 className="relative h-12 w-12 text-foxenfy-primary" />
              </div>
              <div>
                <span className="text-3xl font-foxenfy-display font-bold bg-gradient-to-r from-foxenfy-primary to-foxenfy-accent bg-clip-text text-transparent">
                  Foxenfy
                </span>
                <div className="text-xs text-foxenfy-gray-400 font-medium tracking-widest uppercase">
                  Premium Music
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-foxenfy-gray-400">Sign in to continue your musical journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl animate-slide-down">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-foxenfy-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-4 py-4 text-base"
                  placeholder="Enter your email address"
                />
                {formData.email && /\S+@\S+\.\S+/.test(formData.email) && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foxenfy-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-12 py-4 text-base"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-foxenfy-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isOnline}
              className={`w-full btn-primary flex items-center justify-center space-x-2 py-4 text-base font-semibold ${
                loading || !isOnline ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span>Signing In...</span>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-foxenfy-primary hover:text-foxenfy-accent transition-colors duration-200 text-sm font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-foxenfy-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-foxenfy-gray-900 text-foxenfy-gray-400 font-medium">or</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-foxenfy-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-foxenfy-primary hover:text-foxenfy-accent font-semibold transition-colors duration-200"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-foxenfy-gray-500 text-xs">
            © 2025 Foxenfy. Premium music streaming experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;