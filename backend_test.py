#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Lokatani Marketplace
Tests all authentication, product, cart, and order endpoints with role-based authorization
"""

import requests
import json
import base64
from datetime import datetime
import sys

# API Configuration
BASE_URL = "https://harvest-market-3.preview.emergentagent.com/api"

# Test credentials
FARMER_CREDENTIALS = {
    "username": "testfarmer",
    "password": "test123",
    "name": "Test Farmer",
    "phone": "+62812345678",
    "role": "farmer"
}

BUYER_CREDENTIALS = {
    "username": "testbuyer", 
    "password": "test123",
    "name": "Test Buyer",
    "phone": "+62812345679",
    "role": "buyer"
}

# Global variables to store tokens and IDs
farmer_token = None
buyer_token = None
farmer_user_id = None
buyer_user_id = None
test_product_id = None

def log_test(test_name, status, details=""):
    """Log test results with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    status_symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    print(f"[{timestamp}] {status_symbol} {test_name}")
    if details:
        print(f"    {details}")
    print()

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
        return response
        
    except requests.exceptions.RequestException as e:
        log_test(f"Request to {endpoint}", "FAIL", f"Network error: {str(e)}")
        return None

def get_auth_headers(token):
    """Get authorization headers with Bearer token"""
    return {"Authorization": f"Bearer {token}"}

def test_user_registration():
    """Test user registration for both farmer and buyer roles"""
    global farmer_token, buyer_token, farmer_user_id, buyer_user_id
    
    # Test farmer registration
    response = make_request("POST", "/register", FARMER_CREDENTIALS)
    if response and response.status_code == 200:
        data = response.json()
        farmer_token = data.get("access_token")
        farmer_user_id = data.get("user", {}).get("id")
        log_test("Farmer Registration", "PASS", f"Token received, User ID: {farmer_user_id}")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Farmer Registration", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test buyer registration
    response = make_request("POST", "/register", BUYER_CREDENTIALS)
    if response and response.status_code == 200:
        data = response.json()
        buyer_token = data.get("access_token")
        buyer_user_id = data.get("user", {}).get("id")
        log_test("Buyer Registration", "PASS", f"Token received, User ID: {buyer_user_id}")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Buyer Registration", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
        
    return True

def test_user_login():
    """Test user login functionality"""
    global farmer_token, buyer_token
    
    # Test farmer login
    login_data = {"username": FARMER_CREDENTIALS["username"], "password": FARMER_CREDENTIALS["password"]}
    response = make_request("POST", "/login", login_data)
    if response and response.status_code == 200:
        data = response.json()
        farmer_token = data.get("access_token")  # Update token
        log_test("Farmer Login", "PASS", "Valid credentials accepted")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Farmer Login", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test buyer login
    login_data = {"username": BUYER_CREDENTIALS["username"], "password": BUYER_CREDENTIALS["password"]}
    response = make_request("POST", "/login", login_data)
    if response and response.status_code == 200:
        data = response.json()
        buyer_token = data.get("access_token")  # Update token
        log_test("Buyer Login", "PASS", "Valid credentials accepted")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Buyer Login", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test invalid login
    invalid_data = {"username": "wronguser", "password": "wrongpass"}
    response = make_request("POST", "/login", invalid_data)
    if response and response.status_code == 401:
        log_test("Invalid Login", "PASS", "Correctly rejected invalid credentials")
    else:
        log_test("Invalid Login", "FAIL", f"Expected 401, got {response.status_code if response else 'N/A'}")
        return False
        
    return True

def test_get_me():
    """Test /me endpoint with valid JWT token"""
    if not farmer_token:
        log_test("Get Me (Farmer)", "FAIL", "No farmer token available")
        return False
        
    response = make_request("GET", "/me", headers=get_auth_headers(farmer_token))
    if response and response.status_code == 200:
        data = response.json()
        if data.get("role") == "farmer":
            log_test("Get Me (Farmer)", "PASS", f"User info retrieved: {data.get('name')}")
        else:
            log_test("Get Me (Farmer)", "FAIL", f"Wrong role returned: {data.get('role')}")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Get Me (Farmer)", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
        
    return True

def test_product_crud():
    """Test all product CRUD operations"""
    global test_product_id
    
    if not farmer_token:
        log_test("Product CRUD", "FAIL", "No farmer token available")
        return False
    
    # Create a sample base64 image (1x1 pixel PNG)
    sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
    
    # Test CREATE product (farmer only)
    product_data = {
        "name": "Fresh Tomatoes",
        "description": "Organic tomatoes from local farm",
        "price": 25000.0,
        "location": "Bandung, West Java",
        "image_base64": sample_image
    }
    
    response = make_request("POST", "/products", product_data, get_auth_headers(farmer_token))
    if response and response.status_code == 200:
        data = response.json()
        test_product_id = data.get("id")
        log_test("Create Product (Farmer)", "PASS", f"Product created with ID: {test_product_id}")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Create Product (Farmer)", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test CREATE product as buyer (should fail)
    if buyer_token:
        response = make_request("POST", "/products", product_data, get_auth_headers(buyer_token))
        if response and response.status_code == 403:
            log_test("Create Product (Buyer - Should Fail)", "PASS", "Correctly rejected buyer creating product")
        else:
            log_test("Create Product (Buyer - Should Fail)", "FAIL", f"Expected 403, got {response.status_code if response else 'N/A'}")
            return False
    
    # Test READ all products
    response = make_request("GET", "/products")
    if response and response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            log_test("Get All Products", "PASS", f"Retrieved {len(data)} products")
        else:
            log_test("Get All Products", "FAIL", "No products returned")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Get All Products", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test READ single product
    if test_product_id:
        response = make_request("GET", f"/products/{test_product_id}")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("name") == "Fresh Tomatoes":
                log_test("Get Single Product", "PASS", f"Product details retrieved: {data.get('name')}")
            else:
                log_test("Get Single Product", "FAIL", f"Wrong product data: {data.get('name')}")
                return False
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            log_test("Get Single Product", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
    
    # Test GET my products (farmer only)
    response = make_request("GET", "/my-products", headers=get_auth_headers(farmer_token))
    if response and response.status_code == 200:
        data = response.json()
        if isinstance(data, list):
            log_test("Get My Products (Farmer)", "PASS", f"Retrieved {len(data)} farmer's products")
        else:
            log_test("Get My Products (Farmer)", "FAIL", "Invalid response format")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Get My Products (Farmer)", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test UPDATE product
    if test_product_id:
        update_data = {
            "name": "Premium Fresh Tomatoes",
            "price": 30000.0
        }
        response = make_request("PUT", f"/products/{test_product_id}", update_data, get_auth_headers(farmer_token))
        if response and response.status_code == 200:
            data = response.json()
            if data.get("name") == "Premium Fresh Tomatoes" and data.get("price") == 30000.0:
                log_test("Update Product (Farmer)", "PASS", "Product updated successfully")
            else:
                log_test("Update Product (Farmer)", "FAIL", f"Update not reflected: {data.get('name')}, {data.get('price')}")
                return False
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            log_test("Update Product (Farmer)", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
            return False
    
    return True

def test_cart_operations():
    """Test all cart operations"""
    if not buyer_token or not test_product_id:
        log_test("Cart Operations", "FAIL", "Missing buyer token or product ID")
        return False
    
    # Test ADD to cart
    cart_data = {
        "product_id": test_product_id,
        "quantity": 2
    }
    
    response = make_request("POST", "/cart/add", cart_data, get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        log_test("Add to Cart", "PASS", "Product added to cart successfully")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Add to Cart", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test VIEW cart
    response = make_request("GET", "/cart", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        if len(items) > 0 and items[0].get("quantity") == 2:
            log_test("View Cart", "PASS", f"Cart contains {len(items)} items")
        else:
            log_test("View Cart", "FAIL", f"Cart items not as expected: {items}")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("View Cart", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test REMOVE from cart
    response = make_request("DELETE", f"/cart/remove/{test_product_id}", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        log_test("Remove from Cart", "PASS", "Product removed from cart")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Remove from Cart", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Add item back for order testing
    response = make_request("POST", "/cart/add", cart_data, get_auth_headers(buyer_token))
    
    # Test CLEAR cart
    response = make_request("POST", "/cart/clear", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        log_test("Clear Cart", "PASS", "Cart cleared successfully")
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Clear Cart", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    return True

def test_order_operations():
    """Test order creation and retrieval"""
    if not buyer_token or not test_product_id:
        log_test("Order Operations", "FAIL", "Missing buyer token or product ID")
        return False
    
    # First add item to cart for order
    cart_data = {
        "product_id": test_product_id,
        "quantity": 1
    }
    make_request("POST", "/cart/add", cart_data, get_auth_headers(buyer_token))
    
    # Test CREATE order (buyer only)
    order_data = {
        "items": [
            {
                "product_id": test_product_id,
                "product_name": "Premium Fresh Tomatoes",
                "quantity": 1,
                "price": 30000.0
            }
        ],
        "total": 30000.0
    }
    
    response = make_request("POST", "/orders", order_data, get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        data = response.json()
        if data.get("status") == "completed" and data.get("total") == 30000.0:
            log_test("Create Order (Buyer)", "PASS", f"Order created with status: {data.get('status')}")
        else:
            log_test("Create Order (Buyer)", "FAIL", f"Order data incorrect: {data}")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Create Order (Buyer)", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Test CREATE order as farmer (should fail)
    if farmer_token:
        response = make_request("POST", "/orders", order_data, get_auth_headers(farmer_token))
        if response and response.status_code == 403:
            log_test("Create Order (Farmer - Should Fail)", "PASS", "Correctly rejected farmer creating order")
        else:
            log_test("Create Order (Farmer - Should Fail)", "FAIL", f"Expected 403, got {response.status_code if response else 'N/A'}")
            return False
    
    # Test GET orders
    response = make_request("GET", "/orders", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        data = response.json()
        if isinstance(data, list) and len(data) > 0:
            log_test("Get Order History", "PASS", f"Retrieved {len(data)} orders")
        else:
            log_test("Get Order History", "FAIL", "No orders returned")
            return False
    else:
        error_msg = response.json().get("detail", "Unknown error") if response else "No response"
        log_test("Get Order History", "FAIL", f"Status: {response.status_code if response else 'N/A'}, Error: {error_msg}")
        return False
    
    # Verify cart was cleared after order
    response = make_request("GET", "/cart", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        if len(items) == 0:
            log_test("Cart Cleared After Order", "PASS", "Cart is empty after order creation")
        else:
            log_test("Cart Cleared After Order", "FAIL", f"Cart still has {len(items)} items")
            return False
    
    return True

def test_role_authorization():
    """Test role-based authorization across all endpoints"""
    if not farmer_token or not buyer_token:
        log_test("Role Authorization", "FAIL", "Missing tokens for role testing")
        return False
    
    # Test buyer trying to access farmer-only endpoints
    response = make_request("GET", "/my-products", headers=get_auth_headers(buyer_token))
    if response and response.status_code == 403:
        log_test("Buyer Access My-Products (Should Fail)", "PASS", "Correctly blocked buyer from farmer endpoint")
    else:
        log_test("Buyer Access My-Products (Should Fail)", "FAIL", f"Expected 403, got {response.status_code if response else 'N/A'}")
        return False
    
    return True

def cleanup_test_data():
    """Clean up test data created during testing"""
    if farmer_token and test_product_id:
        # Delete the test product
        response = make_request("DELETE", f"/products/{test_product_id}", headers=get_auth_headers(farmer_token))
        if response and response.status_code == 200:
            log_test("Cleanup - Delete Test Product", "PASS", "Test product deleted")
        else:
            log_test("Cleanup - Delete Test Product", "WARN", "Could not delete test product")

def main():
    """Run all backend API tests"""
    print("=" * 60)
    print("🧪 LOKATANI MARKETPLACE BACKEND API TESTING")
    print("=" * 60)
    print(f"Testing API at: {BASE_URL}")
    print()
    
    test_results = []
    
    # Authentication Tests
    print("🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    test_results.append(("User Registration", test_user_registration()))
    test_results.append(("User Login", test_user_login()))
    test_results.append(("Get Me Endpoint", test_get_me()))
    
    # Product Tests
    print("📦 PRODUCT CRUD TESTS")
    print("-" * 30)
    test_results.append(("Product CRUD Operations", test_product_crud()))
    
    # Cart Tests
    print("🛒 CART OPERATION TESTS")
    print("-" * 30)
    test_results.append(("Cart Operations", test_cart_operations()))
    
    # Order Tests
    print("📋 ORDER OPERATION TESTS")
    print("-" * 30)
    test_results.append(("Order Operations", test_order_operations()))
    
    # Authorization Tests
    print("🔒 ROLE AUTHORIZATION TESTS")
    print("-" * 30)
    test_results.append(("Role Authorization", test_role_authorization()))
    
    # Cleanup
    print("🧹 CLEANUP")
    print("-" * 30)
    cleanup_test_data()
    
    # Summary
    print("=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the logs above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())