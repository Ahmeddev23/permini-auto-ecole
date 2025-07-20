#!/usr/bin/env python3
import requests
import json

# Test data for registration
test_data = {
    "username": "test@nouveau.com",
    "email": "test@nouveau.com", 
    "password": "TestPass123",
    "password_confirm": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "driving_school",
    "phone": "+216123456789",
    "cin": "87654321",
    "school_name": "Auto-école Test",
    "school_address": "123 Rue Test, Tunis",
    "school_phone": "+216987654321",
    "school_email": "contact@test-autoecole.com"
}

# Test registration endpoint
try:
    response = requests.post(
        "http://127.0.0.1:8000/api/auth/register/",
        json=test_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
        data = response.json()
        print(f"User: {data.get('user', {}).get('email')}")
        print(f"Token: {data.get('token', 'No token')[:20]}...")
    else:
        print("❌ Registration failed!")
        
except Exception as e:
    print(f"Error: {e}")
