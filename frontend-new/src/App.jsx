import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import './App.css';

function App() {
  //const [userId, setUserId] = useState(null);
  const [userId, setUserId] = useState(() => {
      return localStorage.getItem('userId') || null
  });

  return (
    <Router>
      <div className="app-container">
        <header>
          <h1> Expense Tracker</h1>
        </header>
        <main>
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm setUserId={setUserId} />} />
            <Route path="/dashboard" element={<Dashboard userId={userId} />} />
            <Route path="/expenses" element={<Expenses userId={userId} />} />
            <Route path="/" element={
              <div>
                <h2>Welcome</h2>
                <nav>
                  <ul>
                    <li><Link to="/register">Register</Link></li>
                    <li><Link to="/login">Login</Link></li>
                  </ul>
                </nav>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
