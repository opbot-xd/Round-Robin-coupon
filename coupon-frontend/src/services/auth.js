import axios from 'axios';

const API_URL = "https://round-robin-coupon.onrender.com/api";

export const login = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/admin/login`, 
      { username, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const logout = async () => {
  try {
    await axios.post(
      `${API_URL}/admin/logout`,
      {},
      { withCredentials: true }
    );
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};

export const checkAuthStatus = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/check-auth`,
      { withCredentials: true }
    );
    return response.data.isAuthenticated || false;
  } catch (error) {
    return false;
  }
};