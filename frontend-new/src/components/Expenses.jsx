import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EXPENSES_URL } from '../config.js';

const Expenses = ({ userId }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ amount: '', category: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const effectiveUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    if (!effectiveUserId) {
      navigate('/login');
      return;
    }
    fetchExpenses();
  }, [effectiveUserId, navigate]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${EXPENSES_URL}/${effectiveUserId}`);
      setExpenses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setExpenses([]);
      setMessage("Error fetching expenses.");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!effectiveUserId) {
      alert('Please log in first.');
      return;
    }

    const expenseData = {
      user_id: effectiveUserId,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
    };

    try {
      await axios.post(EXPENSES_URL, expenseData);
      setNewExpense({ amount: '', category: '' });
      fetchExpenses(); // Refresh the list
      setMessage('Expense added successfully!');
    } catch (error) {
      setMessage('Error adding expense.');
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expenses-container">
      <h2>Your Expenses</h2>

      <h3>Total Spent: ${totalAmount.toFixed(2)}</h3>

      <form onSubmit={handleAddExpense} className="add-expense-form">
        <input
          type="number"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={newExpense.category}
          onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
          required
        />
        <button type="submit">Add Expense</button>
      </form>

      {expenses.length > 0 ? (
        <ul className="expense-list">
          {expenses.map((exp) => (
            <li key={exp.id}>
              ${exp.amount.toFixed(2)} ({exp.category})
            </li>
          ))}
        </ul>
      ) : (
        <p>No expenses found. Add one above!</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default Expenses;

