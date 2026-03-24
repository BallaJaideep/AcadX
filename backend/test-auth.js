import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

async function testAuth() {
  try {
    console.log("1. Attempting login...");
    const loginRes = await api.post('/auth/login', {
      email: 'student1@example.com', // fallback credentials, assuming they exist or will fail
      password: 'password123'
    });
    
    console.log("Login Success! Token:", loginRes.data.token.substring(0, 20) + '...');
    const token = loginRes.data.token;

    console.log("\n2. Fetching /auth/me...");
    const meRes = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Me Response:", meRes.data.user.email);
  } catch (err) {
    if (err.response) {
      console.error("❌ API Error:", err.response.status, err.response.data);
    } else {
      console.error("❌ Network Error:", err.message);
    }
  }
}

testAuth();
