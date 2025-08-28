import React, { useState, useEffect } from 'react';
 
 // Main App component 
 export default function App() { 
   const [isLoggedIn, setIsLoggedIn] = useState(false); 
   const [user, setUser] = useState(null); 
   const [currentPage, setCurrentPage] = useState('login'); // 'login', 'dashboard' 
   const [loginForm, setLoginForm] = useState({ username: '', password: '' }); 
   const [registerForm, setRegisterForm] = useState({ username: '', password: '' }); 
   const [message, setMessage] = useState(''); 
   const [showModal, setShowModal] = useState(false); 

   // API URLs for the backend services 
   // IMPORTANT: The hostnames now correspond to the service names in your docker-compose.yml 
   const USER_SERVICE_URL = 'http://3.95.198.203:5000'; 
   const EXPENSE_SERVICE_URL = 'http://3.95.198.20:8080'; 
   const ANALYTICS_SERVICE_URL = 'http://3.95.198.20:8090'; 

   const [expenses, setExpenses] = useState([]); 
   const [summary, setSummary] = useState(null); 
   const [expenseForm, setExpenseForm] = useState({ category: '', amount: '' }); 

   // Function to handle form input changes 
   const handleLoginChange = (e) => { 
     setLoginForm({ ...loginForm, [e.target.name]: e.target.value }); 
   }; 

   const handleRegisterChange = (e) => { 
     setRegisterForm({ ...registerForm, [e.target.name]: e.target.value }); 
   }; 

   const handleExpenseChange = (e) => { 
     setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value }); 
   }; 

   // Function to handle login form submission 
   const handleLogin = async (e) => { 
     e.preventDefault(); 
     try { 
       // Change: API endpoint is now /login 
       const response = await fetch(`${USER_SERVICE_URL}/login`, { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify(loginForm), 
       }); 
       const data = await response.json(); 
       if (response.ok) { 
         setIsLoggedIn(true); 
         // Change: API returns user_id, which we use to set the user state 
         setUser({ id: data.user_id, username: loginForm.username }); 
         setCurrentPage('dashboard'); 
         setMessage('Login successful!'); 
         setShowModal(true); 
       } else { 
         setMessage(data.detail || 'Login failed'); 
         setShowModal(true); 
       } 
     } catch (error) { 
       console.error('Login error:', error); 
       setMessage('Network error. Please try again.'); 
       setShowModal(true); 
     } 
   }; 

   // Function to handle registration form submission 
   const handleRegister = async (e) => { 
     e.preventDefault(); 
     try { 
       // Change: API endpoint is now /register 
       const response = await fetch(`${USER_SERVICE_URL}/register`, { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify(registerForm), 
       }); 
       const data = await response.json(); 
       if (response.ok) { 
         setMessage('Registration successful! Please log in.'); 
         setShowModal(true); 
         setCurrentPage('login'); 
       } else { 
         setMessage(data.detail || 'Registration failed'); 
         setShowModal(true); 
       } 
     } catch (error) { 
       console.error('Registration error:', error); 
       setMessage('Network error. Please try again.'); 
       setShowModal(true); 
     } 
   }; 

   // Function to fetch expenses and analytics data 
   const fetchUserData = async () => { 
     if (user && user.id) { 
       // Fetch expenses 
       try { 
         // Change: API endpoint for fetching expenses by user ID is now /expenses/{userId} 
         const expenseResponse = await fetch(`${EXPENSE_SERVICE_URL}/expenses/${user.id}`); 
         const expenseData = await expenseResponse.json(); 
         if (expenseResponse.ok) { 
           setExpenses(expenseData); 
         } 
       } catch (error) { 
         console.error('Failed to fetch expenses:', error); 
         setMessage('Failed to load expenses. Please check the expense service.'); 
         setShowModal(true); 
       } 

       // Fetch analytics summary 
       try { 
         // Change: API endpoint for fetching analytics summary is now /{userId} 
         const summaryResponse = await fetch(`${ANALYTICS_SERVICE_URL}/${user.id}`); 
         const summaryData = await summaryResponse.json(); 
         if (summaryResponse.ok) { 
           setSummary(summaryData); 
         } 
       } catch (error) { 
         console.error('Failed to fetch summary:', error); 
         setMessage('Failed to load analytics. Please check the analytics service.'); 
         setShowModal(true); 
       } 
     } 
   }; 

   // Fetch user data when logged in 
   useEffect(() => { 
     if (isLoggedIn) { 
       fetchUserData(); 
     } 
   }, [isLoggedIn, user]); 

   // Function to handle adding a new expense 
   const handleAddExpense = async (e) => { 
     e.preventDefault(); 
     const newExpense = { 
       ...expenseForm, 
       user_id: user.id, 
       amount: parseFloat(expenseForm.amount), 
     }; 

     try { 
       // Change: API endpoint for adding an expense is now /expenses 
       const response = await fetch(`${EXPENSE_SERVICE_URL}/expenses`, { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify(newExpense), 
       }); 
       const data = await response.json(); 
       if (response.ok) { 
         setMessage('Expense added successfully!'); 
         setShowModal(true); 
         setExpenseForm({ category: '', amount: '' }); 
         // Refresh data after adding a new expense 
         fetchUserData(); 
       } else { 
         setMessage(data.detail || 'Failed to add expense'); 
         setShowModal(true); 
       } 
     } catch (error) { 
       console.error('Add expense error:', error); 
       setMessage('Network error. Failed to add expense.'); 
       setShowModal(true); 
     } 
   }; 

   // Modal for displaying messages 
   const Modal = ({ message, onClose }) => { 
     return ( 
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50"> 
         <div className="relative bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4"> 
           <div className="text-center"> 
             <h3 className="text-lg leading-6 font-medium text-gray-900">Notification</h3> 
             <div className="mt-2"> 
               <p className="text-sm text-gray-500">{message}</p> 
             </div> 
             <div className="mt-4"> 
               <button 
                 type="button" 
                 className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200" 
                 onClick={onClose} 
               > 
                 Close 
               </button> 
             </div> 
           </div> 
         </div> 
       </div> 
     ); 
   }; 

   // Header component with navigation 
   const Header = ({ onLogout }) => ( 
     <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-b-xl"> 
       <h1 className="text-2xl font-bold text-indigo-600">Expense Manager</h1> 
       {isLoggedIn && ( 
         <nav> 
           <button onClick={onLogout} className="text-red-500 font-medium hover:text-red-700 transition-colors duration-200"> 
             Logout 
           </button> 
         </nav> 
       )} 
     </header> 
   ); 

   // Render different pages based on state 
   const renderPage = () => { 
     switch (currentPage) { 
       case 'login': 
         return ( 
           <div className="space-y-6"> 
             <h2 className="text-3xl font-bold text-center text-indigo-700">Login</h2> 
             <form onSubmit={handleLogin} className="space-y-4"> 
               <div> 
                 <label className="block text-sm font-medium text-gray-700">Username</label> 
                 <input 
                   type="text" 
                   name="username" 
                   value={loginForm.username} 
                   onChange={handleLoginChange} 
                   required 
                   className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                   placeholder="Enter your username" 
                 /> 
               </div> 
               <div> 
                 <label className="block text-sm font-medium text-gray-700">Password</label> 
                 <input 
                   type="password" 
                   name="password" 
                   value={loginForm.password} 
                   onChange={handleLoginChange} 
                   required 
                   className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                   placeholder="Enter your password" 
                 /> 
               </div> 
               <button 
                 type="submit" 
                 className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200" 
               > 
                 Login 
               </button> 
             </form> 
             <p className="text-center text-sm text-gray-600"> 
               Don't have an account?{' '} 
               <button 
                 onClick={() => setCurrentPage('register')} 
                 className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200" 
               > 
                 Register here 
               </button> 
             </p> 
           </div> 
         ); 

       case 'register': 
         return ( 
           <div className="space-y-6"> 
             <h2 className="text-3xl font-bold text-center text-indigo-700">Register</h2> 
             <form onSubmit={handleRegister} className="space-y-4"> 
               <div> 
                 <label className="block text-sm font-medium text-gray-700">Username</label> 
                 <input 
                   type="text" 
                   name="username" 
                   value={registerForm.username} 
                   onChange={handleRegisterChange} 
                   required 
                   className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                   placeholder="Choose a username" 
                 /> 
               </div> 
               <div> 
                 <label className="block text-sm font-medium text-gray-700">Password</label> 
                 <input 
                   type="password" 
                   name="password" 
                   value={registerForm.password} 
                   onChange={handleRegisterChange} 
                   required 
                   className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                   placeholder="Create a password" 
                 /> 
               </div> 
               <button 
                 type="submit" 
                 className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200" 
               > 
                 Register 
               </button> 
             </form> 
             <p className="text-center text-sm text-gray-600"> 
               Already have an account?{' '} 
               <button 
                 onClick={() => setCurrentPage('login')} 
                 className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors duration-200" 
               > 
                 Log in 
               </button> 
             </p> 
           </div> 
         ); 

       case 'dashboard': 
         return ( 
           <div className="space-y-8"> 
             <h2 className="text-3xl font-bold text-center text-indigo-700">Welcome, {user?.username}!</h2> 

             {/* Add Expense Form */} 
             <div className="bg-white p-6 rounded-xl shadow-lg"> 
               <h3 className="text-2xl font-semibold mb-4 text-gray-800">Add New Expense</h3> 
               <form onSubmit={handleAddExpense} className="space-y-4"> 
                 <div> 
                   <label className="block text-sm font-medium text-gray-700">Category</label> 
                   <input 
                     type="text" 
                     name="category" 
                     value={expenseForm.category} 
                     onChange={handleExpenseChange} 
                     required 
                     className="mt-1 block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                     placeholder="e.g., Groceries, Transport" 
                   /> 
                 </div> 
                 <div> 
                   <label className="block text-sm font-medium text-gray-700">Amount</label> 
                   <input 
                     type="number" 
                     name="amount" 
                     value={expenseForm.amount} 
                     onChange={handleExpenseChange} 
                     required 
                     step="0.01" 
                     className="mt-1 block w-full border border-gray-300 rounded-lg p-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
                     placeholder="e.g., 25.50" 
                   /> 
                 </div> 
                 <button 
                   type="submit" 
                   className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200" 
                 > 
                   Add Expense 
                 </button> 
               </form> 
             </div> 

             {/* Analytics Summary */} 
             <div className="bg-white p-6 rounded-xl shadow-lg"> 
               <h3 className="text-2xl font-semibold mb-4 text-gray-800">Expense Summary</h3> 
               {summary ? ( 
                 <div className="space-y-4"> 
                   <div className="p-4 bg-indigo-100 rounded-lg shadow-inner"> 
                     <h4 className="text-lg font-medium text-indigo-800">Total Expenses:</h4> 
                     <p className="text-3xl font-bold text-indigo-900">${summary.totalAmount.toFixed(2)}</p> 
                   </div> 
                   <div> 
                     <h4 className="text-lg font-medium text-gray-800 mb-2">Breakdown by Category:</h4> 
                     {Object.keys(summary.categoryTotals).length > 0 ? ( 
                       <ul className="space-y-2"> 
                         {Object.entries(summary.categoryTotals).map(([category, total]) => ( 
                           <li key={category} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"> 
                             <span className="text-gray-700 font-semibold">{category}</span> 
                             <span className="font-mono text-gray-900">${total.toFixed(2)}</span> 
                           </li> 
                         ))} 
                       </ul> 
                     ) : ( 
                       <p className="text-gray-500">No expenses recorded yet.</p> 
                     )} 
                 </div> 
                 </div> 
               ) : ( 
                 <p className="text-gray-500">Loading summary...</p> 
               )} 
             </div> 

             {/* Expense List */} 
             <div className="bg-white p-6 rounded-xl shadow-lg"> 
               <h3 className="text-2xl font-semibold mb-4 text-gray-800">All Expenses</h3> 
               {expenses.length > 0 ? ( 
                 <ul className="space-y-2"> 
                   {expenses.map((exp) => ( 
                     <li key={exp.id} className="p-3 bg-gray-100 rounded-lg flex justify-between items-center"> 
                       <span className="text-gray-700 font-medium"> 
                         {exp.category}: <span className="font-bold">${exp.amount.toFixed(2)}</span> 
                       </span> 
                     </li> 
                   ))} 
                 </ul> 
               ) : ( 
                 <p className="text-gray-500">No expenses recorded yet. Add one above!</p> 
               )} 
             </div> 
           </div> 
         ); 

       default: 
         return null; 
     } 
   }; 

   return ( 
     <div className="font-sans antialiased bg-gray-100 min-h-screen"> 
       {showModal && <Modal message={message} onClose={() => setShowModal(false)} />} 
       <Header onLogout={() => { setIsLoggedIn(false); setUser(null); setCurrentPage('login'); }} /> 
       <main className="container mx-auto p-4 sm:p-8"> 
         <div className="w-full max-w-2xl mx-auto mt-8 bg-white p-8 rounded-2xl shadow-xl"> 
           {renderPage()} 
         </div> 
       </main> 
     </div> 
   ); 
 }
