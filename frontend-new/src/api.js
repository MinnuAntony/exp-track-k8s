import axios from 'axios';
import { EXPENSES_URL } from './config.js'; // <-- Added import

const USER_SERVICE_URL = '/user-service';
//const EXPENSE_SERVICE_URL = '/expense-service';
// const EXPENSE_SERVICE_URL = 'http://3.91.202.159:8080/expense-service'; // <-- replaced by EXPENSES_URL
const ANALYTICS_SERVICE_URL = '/analytics-service';
//const ANALYTICS_SERVICE_URL = 'http://13.222.165.100:8090/analytics-service';

// Register user with safe error handling
export const registerUser = async (username, password) => {
  try {
    const res = await axios.post(`${USER_SERVICE_URL}/register`, { username, password });
    console.log("Register response:", res);
    return res.data; // return data directly
  } catch (error) {
    console.error("Register error:", error);
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail || 'Registration failed');
    } else {
      throw new Error(error.message || 'Registration failed');
    }
  }
};

// Login user
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

// Expenses

// Get all expenses for a specific user
export const getExpenses = async (userId) => {
  const res = await axios.get(`${EXPENSES_URL}/${userId}`); // <-- changed URL
  return res.data;
};

// Add a new expense
export const addExpense = async (expense) => {
  const payload = {
    user_id: expense.user_id,
    category: expense.category,
    amount: parseFloat(expense.amount),
  };
  console.log(EXPENSES_URL); // optional debug
  const res = await axios.post(EXPENSES_URL, payload); // <-- changed URL
  return res.data;
};

// Analytics
export const getAnalyticsSummary = async (userId) => {
  const res = await axios.get(`${ANALYTICS_SERVICE_URL}/summary/${userId}`);
  return res.data;
};

