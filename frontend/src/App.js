import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Registration from './components/Registration';
import Login from './components/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              Auth Tool
            </Link>
            <div className="navbar-links">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/register" className="nav-link">Register</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="nav-link">Dashboard</Link>
                  <Link onClick={handleLogout} className="nav-link logout">Logout</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/register" 
              element={
                !isAuthenticated ? (
                  <Registration onRegister={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
