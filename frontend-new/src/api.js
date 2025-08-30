import axios from 'axios'; 
import { USER_SERVICE_URL, EXPENSES_URL, ANALYTICS_SERVICE_URL } from './config.js';

// User Service
export const registerUser = async (username, password) => {
  try {
    const res = await axios.post(`${USER_SERVICE_URL}/register`, { username, password });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || 'Registration failed');
    } else {
      throw new Error(error.message || 'Registration failed');
    }
  }
};

export const loginUser = async (username, password) => {
  try {
    const res = await axios.post(`${USER_SERVICE_URL}/login`, { username, password });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || 'Login failed');
    } else {
      throw new Error(error.message || 'Login failed');
    }
  }
};

// Expense Service
export const getExpenses = async (userId) => {
  const res = await axios.get(`${EXPENSES_URL}/${userId}`);
  return res.data;
};

export const addExpense = async (expense) => {
  const payload = {
    user_id: expense.user_id,
    category: expense.category,
    amount: parseFloat(expense.amount),
  };
  const res = await axios.post(EXPENSES_URL, payload);
  return res.data;
};

// Analytics Service
export const getAnalyticsSummary = async (userId) => {
  const res = await axios.get(`${ANALYTICS_SERVICE_URL}/summary/${userId}`);
  return res.data;
};

