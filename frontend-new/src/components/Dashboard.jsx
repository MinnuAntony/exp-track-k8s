import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ userId }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // fallback to localStorage if userId is not passed down
  const effectiveUserId = userId || localStorage.getItem('userId');

  useEffect(() => {
    if (!effectiveUserId) {
      navigate('/login');
      return;
    }
    fetchSummary();
  }, [effectiveUserId, navigate]);

  const fetchSummary = async () => {
    try {
      const response = await getAnalyticsSummary(effectiveUserId);
      setSummary(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  const categoryData = summary 
    ? Object.keys(summary.categoryTotals).map(key => ({
        category: key,
        amount: summary.categoryTotals[key]
      }))
    : [];

  return (
    <div className="dashboard-container">
      <h2>Expense Dashboard</h2>
      <div className="summary-section">
        <p>
          Total Expenses: ${summary?.totalAmount ? summary.totalAmount.toFixed(2) : '0.00'}
        </p>
      </div>

      <div className="chart-section">
        <h3>Expenses by Category</h3>
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No expense data to display chart.</p>
        )}
      </div>

      <div className="actions">
        <button onClick={() => navigate('/expenses')}>
          Go to Expenses
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
