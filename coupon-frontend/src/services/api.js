import axios from 'axios';

const API_URL = "https://round-robin-coupon.onrender.com/api";

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API calls
export const claimCoupon = async () => {
  try {
    const response = await api.post('/coupons/claim');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to claim coupon' };
  }
};

// Admin API calls
export const getAllCoupons = async () => {
  try {
    const response = await api.get('/admin/coupons');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch coupons' };
  }
};

export const addCoupon = async (couponData) => {
  try {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add coupon' };
  }
};

export const updateCoupon = async (id, couponData) => {
  try {
    const response = await api.put(`/admin/coupons/${id}`, couponData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update coupon' };
  }
};

export const getClaimHistory = async () => {
  try {
    const response = await api.get('/admin/claims');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch claim history' };
  }
};