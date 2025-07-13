#!/usr/bin/env python3
"""
Foxenfy Backend API Testing Suite
Tests all API endpoints for the Foxenfy music streaming application
"""

import requests
import json
import sys
import time
from datetime import datetime
from typing import Dict, Any, Optional

class FoxenfyAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url.rstrip('/')
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text, "status_code": response.status_code}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.make_request('GET', '/api/health')
        details = f"Status: {response.get('status', 'unknown')}"
        self.log_test("Health Check", success, details)
        return success

    def test_root_endpoint(self):
        """Test root endpoint"""
        success, response = self.make_request('GET', '/')
        details = f"Message: {response.get('message', 'No message')}"
        self.log_test("Root Endpoint", success, details)
        return success

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_user = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@foxenfy.com",
            "password": "TestPass123!"
        }

        success, response = self.make_request('POST', '/api/auth/register', test_user, 200)
        
        if success:
            self.token = response.get('access_token')
            self.user_data = response.get('user')
            details = f"User: {self.user_data.get('username')} | Token: {'✓' if self.token else '✗'}"
        else:
            details = f"Error: {response.get('detail', 'Unknown error')}"

        self.log_test("User Registration", success, details)
        return success

    def test_duplicate_registration(self):
        """Test duplicate user registration (should fail)"""
        if not self.user_data:
            self.log_test("Duplicate Registration", False, "No user data from previous registration")
            return False

        duplicate_user = {
            "username": self.user_data['username'],
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }

        success, response = self.make_request('POST', '/api/auth/register', duplicate_user, 400)
        details = f"Error: {response.get('detail', 'No error message')}"
        self.log_test("Duplicate Registration Prevention", success, details)
        return success

    def test_user_login(self):
        """Test user login"""
        if not self.user_data:
            self.log_test("User Login", False, "No user data available")
            return False

        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }

        success, response = self.make_request('POST', '/api/auth/login', login_data, 200)
        
        if success:
            new_token = response.get('access_token')
            user_info = response.get('user')
            details = f"User: {user_info.get('username')} | New Token: {'✓' if new_token else '✗'}"
        else:
            details = f"Error: {response.get('detail', 'Unknown error')}"

        self.log_test("User Login", success, details)
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_login = {
            "email": "invalid@foxenfy.com",
            "password": "wrongpassword"
        }

        success, response = self.make_request('POST', '/api/auth/login', invalid_login, 401)
        details = f"Error: {response.get('detail', 'No error message')}"
        self.log_test("Invalid Login Prevention", success, details)
        return success

    def test_get_user_info(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get User Info", False, "No authentication token")
            return False

        success, response = self.make_request('GET', '/api/auth/me', use_auth=True)
        
        if success:
            details = f"User: {response.get('username')} | Role: {response.get('role')}"
        else:
            details = f"Error: {response.get('detail', 'Unknown error')}"

        self.log_test("Get User Info", success, details)
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        success, response = self.make_request('GET', '/api/auth/me', expected_status=401)
        details = f"Error: {response.get('detail', 'No error message')}"
        self.log_test("Unauthorized Access Prevention", success, details)
        return success

    def test_music_search(self):
        """Test music search functionality"""
        if not self.token:
            self.log_test("Music Search", False, "No authentication token")
            return False

        # Test search with query parameter
        search_url = '/api/search?q=test music&max_results=5'
        success, response = self.make_request('GET', search_url, use_auth=True)
        
        if success:
            songs = response.get('songs', [])
            query = response.get('query', '')
            details = f"Query: '{query}' | Results: {len(songs)}"
        else:
            details = f"Error: {response.get('detail', 'Unknown error')}"

        self.log_test("Music Search", success, details)
        return success

    def test_empty_search(self):
        """Test search with empty query"""
        if not self.token:
            self.log_test("Empty Search", False, "No authentication token")
            return False

        search_url = '/api/search?q='
        success, response = self.make_request('GET', search_url, expected_status=400, use_auth=True)
        details = f"Error: {response.get('detail', 'No error message')}"
        self.log_test("Empty Search Prevention", success, details)
        return success

    def test_chat_messages(self):
        """Test getting chat messages"""
        if not self.token:
            self.log_test("Get Chat Messages", False, "No authentication token")
            return False

        success, response = self.make_request('GET', '/api/chat/messages', use_auth=True)
        
        if success:
            messages = response.get('messages', [])
            total = response.get('total', 0)
            details = f"Messages: {len(messages)} | Total: {total}"
        else:
            details = f"Error: {response.get('detail', 'Unknown error')}"

        self.log_test("Get Chat Messages", success, details)
        return success

    def test_input_validation(self):
        """Test input validation for registration"""
        # Test short username
        invalid_user = {
            "username": "ab",  # Too short
            "email": "test@foxenfy.com",
            "password": "TestPass123!"
        }

        success, response = self.make_request('POST', '/api/auth/register', invalid_user, 422)
        details = f"Validation error caught: {'✓' if 'Username must be at least 3 characters' in str(response) else '✗'}"
        self.log_test("Input Validation (Short Username)", success, details)
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🦊 Starting Foxenfy Backend API Tests")
        print("=" * 50)

        # Basic connectivity tests
        self.test_root_endpoint()
        self.test_health_check()

        # Authentication tests
        self.test_user_registration()
        self.test_duplicate_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_get_user_info()
        self.test_unauthorized_access()

        # Feature tests (require authentication)
        self.test_music_search()
        self.test_empty_search()
        self.test_chat_messages()

        # Validation tests
        self.test_input_validation()

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend API is working correctly.")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Check the details above.")
            return 1

def main():
    """Main test runner"""
    # Use the public endpoint from frontend .env
    backend_url = "http://localhost:8001"  # This will be the public URL in production
    
    print(f"🔗 Testing backend at: {backend_url}")
    
    tester = FoxenfyAPITester(backend_url)
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())