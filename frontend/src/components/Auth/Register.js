import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { authService } from '../../services/authService';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      onLogin(response.user, response.access_token);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 422) {
        const validationError = error.response.data?.detail?.[0];
        if (validationError?.loc?.includes('username')) {
          setError('Username is invalid. Use 3-20 characters with letters, numbers, - or _');
        } else if (validationError?.loc?.includes('email')) {
          setError('Please enter a valid email address');
        } else if (validationError?.loc?.includes('password')) {
          setError('Password must be at least 6 characters long');
        } else {
          setError('Please check your information and try again');
        }
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.request) {
        setError('Connection error. Please check your internet connection.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-400' };
    if (password.length < 10) return { strength: 2, label: 'Good', color: 'text-yellow-400' };
    return { strength: 3, label: 'Strong', color: 'text-green-400' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-foxenfy-black via-foxenfy-dark to-foxenfy-gray-900 relative overflow-hidden py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-foxenfy-secondary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-foxenfy-primary opacity-10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-foxenfy-purple opacity-5 rounded-full blur-3xl animate-float"></div>
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
            <h1 className="text-2xl font-bold text-white mb-2">Join Foxenfy</h1>
            <p className="text-foxenfy-gray-400">Create your account and discover amazing music</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl animate-slide-down">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-foxenfy-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-4 py-4 text-base"
                  placeholder="Choose a username"
                />
                {formData.username.length >= 3 && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>

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
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-foxenfy-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foxenfy-gray-400">Password strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-foxenfy-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-400' :
                        passwordStrength.strength === 2 ? 'bg-yellow-400' :
                        passwordStrength.strength === 3 ? 'bg-green-400' : 'bg-foxenfy-gray-600'
                      }`}
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foxenfy-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-4 py-4 text-base"
                  placeholder="Confirm your password"
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Check className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-base font-semibold"
            >
              {loading ? (
                <div className="loading-spinner h-5 w-5"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Terms and Conditions */}
          <div className="mt-6 text-center">
            <p className="text-foxenfy-gray-500 text-xs leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-foxenfy-primary hover:text-foxenfy-accent transition-colors duration-200">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-foxenfy-primary hover:text-foxenfy-accent transition-colors duration-200">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
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
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-foxenfy-primary hover:text-foxenfy-accent font-semibold transition-colors duration-200"
                >
                  Sign in here
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

export default Register;