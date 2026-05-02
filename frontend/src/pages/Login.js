import React, { useState } from 'react';
import API from '../api';

function Login({ onLogin }) {
  const [role, setRole] = useState('customer');
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        const endpoint = role === 'customer' ? '/customers/register' : '/owners/register';
        await API.post(endpoint, form);
        setSuccess('Account created! Please log in.');
        setIsRegister(false);
        setForm({ name: '', email: '', phone: '', password: '' });
      } else {
        let endpoint = '/customers/login';
        if (role === 'owner') endpoint = '/owners/login';
        if (role === 'admin') endpoint = '/admins/login';
        
        const res = await API.post(endpoint, { email: form.email, password: form.password });
        onLogin(res.data, role);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>🍽️ Restaurant Booking</h1>
        <p className="subtitle">Table Booking System</p>

        <div className="role-tabs">
          <button className={`role-tab ${role === 'customer' ? 'active' : ''}`} onClick={() => { setRole('customer'); setIsRegister(false); setError(''); }}>Customer</button>
          <button className={`role-tab ${role === 'owner' ? 'active' : ''}`} onClick={() => { setRole('owner'); setIsRegister(false); setError(''); }}>Owner</button>
          <button className={`role-tab ${role === 'admin' ? 'active' : ''}`} onClick={() => { setRole('admin'); setIsRegister(false); setError(''); }}>Admin</button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
            </>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn-primary">{isRegister ? 'Create Account' : 'Log In'}</button>
        </form>

        {role !== 'admin' && (
          <p className="toggle-text">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}>
              {isRegister ? 'Log In' : 'Register'}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
