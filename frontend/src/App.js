import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleLogin = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const handleLogout = () => {
    setUser(null);
    setRole(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        {role === 'customer' && (
          <Route path="/*" element={<CustomerDashboard user={user} onLogout={handleLogout} />} />
        )}
        {role === 'owner' && (
          <Route path="/*" element={<OwnerDashboard user={user} onLogout={handleLogout} />} />
        )}
        {role === 'admin' && (
          <Route path="/*" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
