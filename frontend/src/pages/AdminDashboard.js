import React, { useState, useEffect } from 'react';
import API from '../api';
import { Shield, Users, UtensilsCrossed, CalendarDays, LogOut, BarChart3, Star, Trash2 } from 'lucide-react';

function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [actions, setActions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionForm, setActionForm] = useState({ restaurant_id: '', action_type: 'approve', notes: '' });
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [statsRes, restRes, custRes, ownRes, resRes, actRes, revRes] = await Promise.all([
        API.get('/stats'),
        API.get('/restaurants'),
        API.get('/customers'),
        API.get('/owners'),
        API.get('/reservations'),
        API.get('/admin-actions'),
        API.get('/reviews')
      ]);
      setStats(statsRes.data);
      setRestaurants(restRes.data);
      setCustomers(custRes.data);
      setOwners(ownRes.data);
      setReservations(resRes.data);
      setActions(actRes.data);
      setReviews(revRes.data);
    } catch (err) { console.error(err); }
  };

  const performAction = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin-actions', {
        admin_id: user.admin_id,
        restaurant_id: parseInt(actionForm.restaurant_id),
        action_type: actionForm.action_type,
        notes_explanation: actionForm.notes
      });
      setMessage({ type: 'success', text: `Action "${actionForm.action_type}" performed!` });
      setShowActionModal(false);
      setActionForm({ restaurant_id: '', action_type: 'approve', notes: '' });
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to perform action' });
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer and all their data?')) return;
    try {
      await API.delete(`/customers/${id}`);
      setMessage({ type: 'success', text: 'Customer deleted' });
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete customer' });
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant and all its data?')) return;
    try {
      await API.delete(`/restaurants/${id}`);
      setMessage({ type: 'success', text: 'Restaurant deleted' });
      loadAll();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete restaurant' });
    }
  };

  useEffect(() => { if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000); return () => clearTimeout(t); } }, [message]);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <ul className="sidebar-nav">
          <li className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}>
            <BarChart3 size={18} /> Dashboard
          </li>
          <li className={page === 'restaurants' ? 'active' : ''} onClick={() => setPage('restaurants')}>
            <UtensilsCrossed size={18} /> Restaurants
          </li>
          <li className={page === 'customers' ? 'active' : ''} onClick={() => setPage('customers')}>
            <Users size={18} /> Customers
          </li>
          <li className={page === 'owners' ? 'active' : ''} onClick={() => setPage('owners')}>
            <Users size={18} /> Owners
          </li>
          <li className={page === 'reservations' ? 'active' : ''} onClick={() => setPage('reservations')}>
            <CalendarDays size={18} /> Reservations
          </li>
          <li className={page === 'reviews' ? 'active' : ''} onClick={() => setPage('reviews')}>
            <Star size={18} /> Reviews
          </li>
          <li className={page === 'actions' ? 'active' : ''} onClick={() => setPage('actions')}>
            <Shield size={18} /> Admin Actions
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}><LogOut size={14} /> Log Out</button>
      </div>

      <div className="main-content">
        {message.text && <div className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</div>}

        {/* DASHBOARD */}
        {page === 'dashboard' && stats && (
          <>
            <div className="page-header">
              <h1>Admin Dashboard</h1>
              <p>Platform overview and statistics</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-label">Total Customers</div><div className="stat-value">{stats.total_customers}</div></div>
              <div className="stat-card"><div className="stat-label">Total Restaurants</div><div className="stat-value">{stats.total_restaurants}</div></div>
              <div className="stat-card"><div className="stat-label">Total Reservations</div><div className="stat-value">{stats.total_reservations}</div></div>
              <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value">{stats.pending_reservations}</div></div>
              <div className="stat-card"><div className="stat-label">Confirmed</div><div className="stat-value">{stats.confirmed_reservations}</div></div>
              <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{stats.completed_reservations}</div></div>
              <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">${stats.total_revenue.toFixed(2)}</div></div>
              <div className="stat-card"><div className="stat-label">Total Reviews</div><div className="stat-value">{stats.total_reviews}</div></div>
            </div>
          </>
        )}

        {/* RESTAURANTS */}
        {page === 'restaurants' && (
          <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h1>All Restaurants</h1><p>Manage restaurant listings</p></div>
              <button className="btn btn-success" onClick={() => setShowActionModal(true)}>Perform Action</button>
            </div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Cuisine</th><th>City</th><th>Price</th><th>Day</th><th>Hours</th><th>Actions</th></tr></thead>
                <tbody>
                  {restaurants.map(r => (
                    <tr key={r.restaurant_id}>
                      <td><strong>{r.name}</strong></td>
                      <td><span className="cuisine">{r.cuisine_type}</span></td>
                      <td>{r.city}</td>
                      <td>{r.price_range}</td>
                      <td>{r.day_of_week}</td>
                      <td>{r.opening_time} - {r.closing_time}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={() => deleteRestaurant(r.restaurant_id)}><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showActionModal && (
              <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h2>Perform Admin Action</h2>
                  <form onSubmit={performAction}>
                    <div className="form-group">
                      <label>Restaurant</label>
                      <select value={actionForm.restaurant_id} onChange={e => setActionForm({...actionForm, restaurant_id: e.target.value})} required>
                        <option value="">Select restaurant...</option>
                        {restaurants.map(r => <option key={r.restaurant_id} value={r.restaurant_id}>{r.name} ({r.day_of_week})</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Action Type</label>
                      <select value={actionForm.action_type} onChange={e => setActionForm({...actionForm, action_type: e.target.value})}>
                        <option value="approve">Approve</option>
                        <option value="suspend">Suspend</option>
                        <option value="unsuspend">Unsuspend</option>
                        <option value="delete">Delete</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Notes / Explanation</label>
                      <textarea rows="3" value={actionForm.notes} onChange={e => setActionForm({...actionForm, notes: e.target.value})} placeholder="Reason for this action..." />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="btn-primary">Submit Action</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowActionModal(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* CUSTOMERS */}
        {page === 'customers' && (
          <>
            <div className="page-header"><h1>All Customers</h1><p>Manage customer accounts</p></div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.customer_id}>
                      <td>{c.customer_id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={() => deleteCustomer(c.customer_id)}><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* OWNERS */}
        {page === 'owners' && (
          <>
            <div className="page-header"><h1>All Owners</h1><p>Restaurant owner accounts</p></div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th></tr></thead>
                <tbody>
                  {owners.map(o => (
                    <tr key={o.owner_id}>
                      <td>{o.owner_id}</td>
                      <td><strong>{o.name}</strong></td>
                      <td>{o.email}</td>
                      <td>{o.phone}</td>
                      <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                      <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* RESERVATIONS */}
        {page === 'reservations' && (
          <>
            <div className="page-header"><h1>All Reservations</h1><p>Monitor all bookings</p></div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Customer</th><th>Restaurant</th><th>Party Size</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {reservations.map(r => (
                    <tr key={r.reservation_id}>
                      <td>{r.reservation_id}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.restaurant_name}</td>
                      <td>{r.party_size}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* REVIEWS */}
        {page === 'reviews' && (
          <>
            <div className="page-header"><h1>All Reviews</h1><p>Customer feedback</p></div>
            <div className="card">
              {reviews.length > 0 ? reviews.map(r => (
                <div key={r.review_id} className="review-card">
                  <div className="review-header">
                    <span className="reviewer">{r.customer_name}</span>
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                  </div>
                  <p className="comment">{r.comment}</p>
                </div>
              )) : <div className="empty-state"><p>No reviews yet</p></div>}
            </div>
          </>
        )}

        {/* ADMIN ACTIONS */}
        {page === 'actions' && (
          <>
            <div className="page-header"><h1>Admin Action Log</h1><p>History of all admin actions</p></div>
            <div className="card">
              <table className="data-table">
                <thead><tr><th>Admin</th><th>Restaurant</th><th>Action</th><th>Notes</th><th>Date</th></tr></thead>
                <tbody>
                  {actions.map(a => (
                    <tr key={a.action_id}>
                      <td>{a.admin_name}</td>
                      <td>{a.restaurant_name}</td>
                      <td><span className={`badge badge-${a.action_type}`}>{a.action_type}</span></td>
                      <td>{a.notes_explanation}</td>
                      <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
