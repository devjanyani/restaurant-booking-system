import React, { useState, useEffect } from 'react';
import API from '../api';
import { UtensilsCrossed, CalendarDays, LogOut, Plus, Trash2, CheckCircle, XCircle, Clock, Users, Table2 } from 'lucide-react';

function OwnerDashboard({ user, onLogout }) {
  const [page, setPage] = useState('restaurants');
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [restaurantForm, setRestaurantForm] = useState({
    name: '', email: '', phone: '', cuisine_type: '', price_range: '$', description: '',
    address: '', city: '', state: '', country: 'USA', postal_code: '', day_of_week: 'Monday',
    opening_time: '09:00', closing_time: '22:00', is_closed: false
  });
  const [tableForm, setTableForm] = useState({ table_number: '', capacity: '' });
  const [slotForm, setSlotForm] = useState({ slot_start: '', slot_end: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tab, setTab] = useState('tables');

  useEffect(() => { loadRestaurants(); }, []);

  const loadRestaurants = async () => {
    try {
      const res = await API.get(`/owners/${user.owner_id}/restaurants`);
      setRestaurants(res.data);
    } catch (err) { console.error(err); }
  };

  const loadRestaurantDetails = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const [tablesRes, slotsRes, resRes] = await Promise.all([
        API.get(`/restaurants/${restaurant.restaurant_id}/tables`),
        API.get(`/restaurants/${restaurant.restaurant_id}/timeslots`),
        API.get('/reservations', { params: { restaurant_id: restaurant.restaurant_id } })
      ]);
      setTables(tablesRes.data);
      setTimeslots(slotsRes.data);
      setReservations(resRes.data);
    } catch (err) { console.error(err); }
    setPage('restaurant-detail');
  };

  const addRestaurant = async (e) => {
    e.preventDefault();
    try {
      await API.post('/restaurants', { ...restaurantForm, owner_id: user.owner_id });
      setMessage({ type: 'success', text: 'Restaurant added!' });
      setShowAddRestaurant(false);
      setRestaurantForm({
        name: '', email: '', phone: '', cuisine_type: '', price_range: '$', description: '',
        address: '', city: '', state: '', country: 'USA', postal_code: '', day_of_week: 'Monday',
        opening_time: '09:00', closing_time: '22:00', is_closed: false
      });
      loadRestaurants();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to add restaurant' });
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant and all its data?')) return;
    try {
      await API.delete(`/restaurants/${id}`);
      setMessage({ type: 'success', text: 'Restaurant deleted' });
      setSelectedRestaurant(null);
      setPage('restaurants');
      loadRestaurants();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete restaurant' });
    }
  };

  const addTable = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tables', {
        restaurant_id: selectedRestaurant.restaurant_id,
        table_number: parseInt(tableForm.table_number),
        capacity: parseInt(tableForm.capacity)
      });
      setMessage({ type: 'success', text: 'Table added!' });
      setShowAddTable(false);
      setTableForm({ table_number: '', capacity: '' });
      const res = await API.get(`/restaurants/${selectedRestaurant.restaurant_id}/tables`);
      setTables(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add table' });
    }
  };

  const deleteTable = async (id) => {
    try {
      await API.delete(`/tables/${id}`);
      const res = await API.get(`/restaurants/${selectedRestaurant.restaurant_id}/tables`);
      setTables(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Cannot delete table - it may have reservations' });
    }
  };

  const addTimeslot = async (e) => {
    e.preventDefault();
    try {
      await API.post('/timeslots', {
        restaurant_id: selectedRestaurant.restaurant_id,
        slot_start: slotForm.slot_start,
        slot_end: slotForm.slot_end
      });
      setMessage({ type: 'success', text: 'Timeslot added!' });
      setShowAddSlot(false);
      setSlotForm({ slot_start: '', slot_end: '' });
      const res = await API.get(`/restaurants/${selectedRestaurant.restaurant_id}/timeslots`);
      setTimeslots(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add timeslot' });
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await API.put(`/reservations/${id}`, { status });
      setMessage({ type: 'success', text: `Reservation ${status}` });
      const res = await API.get('/reservations', { params: { restaurant_id: selectedRestaurant.restaurant_id } });
      setReservations(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update reservation' });
    }
  };

  useEffect(() => { if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000); return () => clearTimeout(t); } }, [message]);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🍽️ Owner Panel</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <ul className="sidebar-nav">
          <li className={page === 'restaurants' ? 'active' : ''} onClick={() => { setPage('restaurants'); setSelectedRestaurant(null); }}>
            <UtensilsCrossed size={18} /> My Restaurants
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}><LogOut size={14} /> Log Out</button>
      </div>

      <div className="main-content">
        {message.text && <div className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</div>}

        {/* RESTAURANT LIST */}
        {page === 'restaurants' && (
          <>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>My Restaurants</h1>
                <p>Manage your restaurant listings</p>
              </div>
              <button className="btn btn-success" onClick={() => setShowAddRestaurant(true)}><Plus size={14} /> Add Restaurant</button>
            </div>
            <div className="restaurant-grid">
              {restaurants.map(r => (
                <div key={r.restaurant_id} className="restaurant-card" onClick={() => loadRestaurantDetails(r)}>
                  <h3>{r.name}</h3>
                  <span className="cuisine">{r.cuisine_type}</span>
                  <div className="info-row">{r.address}, {r.city}</div>
                  <div className="info-row">{r.opening_time} - {r.closing_time} ({r.day_of_week})</div>
                </div>
              ))}
              {restaurants.length === 0 && <div className="empty-state"><h3>No restaurants yet</h3><p>Add your first restaurant!</p></div>}
            </div>

            {/* ADD RESTAURANT MODAL */}
            {showAddRestaurant && (
              <div className="modal-overlay" onClick={() => setShowAddRestaurant(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h2>Add New Restaurant</h2>
                  <form onSubmit={addRestaurant}>
                    <div className="form-group"><label>Restaurant Name *</label><input value={restaurantForm.name} onChange={e => setRestaurantForm({...restaurantForm, name: e.target.value})} required /></div>
                    <div className="form-group"><label>Cuisine Type</label><input value={restaurantForm.cuisine_type} onChange={e => setRestaurantForm({...restaurantForm, cuisine_type: e.target.value})} placeholder="Italian, Indian, etc." /></div>
                    <div className="form-group"><label>Price Range</label>
                      <select value={restaurantForm.price_range} onChange={e => setRestaurantForm({...restaurantForm, price_range: e.target.value})}>
                        <option value="$">$ - Budget</option><option value="$$">$$ - Moderate</option><option value="$$$">$$$ - Expensive</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Email</label><input type="email" value={restaurantForm.email} onChange={e => setRestaurantForm({...restaurantForm, email: e.target.value})} /></div>
                    <div className="form-group"><label>Phone</label><input value={restaurantForm.phone} onChange={e => setRestaurantForm({...restaurantForm, phone: e.target.value})} /></div>
                    <div className="form-group"><label>Address</label><input value={restaurantForm.address} onChange={e => setRestaurantForm({...restaurantForm, address: e.target.value})} /></div>
                    <div className="form-group"><label>City</label><input value={restaurantForm.city} onChange={e => setRestaurantForm({...restaurantForm, city: e.target.value})} /></div>
                    <div className="form-group"><label>State</label><input value={restaurantForm.state} onChange={e => setRestaurantForm({...restaurantForm, state: e.target.value})} /></div>
                    <div className="form-group"><label>Postal Code</label><input value={restaurantForm.postal_code} onChange={e => setRestaurantForm({...restaurantForm, postal_code: e.target.value})} /></div>
                    <div className="form-group"><label>Day of Week</label>
                      <select value={restaurantForm.day_of_week} onChange={e => setRestaurantForm({...restaurantForm, day_of_week: e.target.value})}>
                        {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Opening Time</label><input type="time" value={restaurantForm.opening_time} onChange={e => setRestaurantForm({...restaurantForm, opening_time: e.target.value})} /></div>
                    <div className="form-group"><label>Closing Time</label><input type="time" value={restaurantForm.closing_time} onChange={e => setRestaurantForm({...restaurantForm, closing_time: e.target.value})} /></div>
                    <div className="form-group"><label>Description</label><textarea rows="3" value={restaurantForm.description} onChange={e => setRestaurantForm({...restaurantForm, description: e.target.value})} /></div>
                    <div className="modal-actions">
                      <button type="submit" className="btn-primary">Add Restaurant</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowAddRestaurant(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* RESTAURANT DETAIL */}
        {page === 'restaurant-detail' && selectedRestaurant && (
          <>
            <span className="back-btn" onClick={() => { setPage('restaurants'); setSelectedRestaurant(null); }}>← Back to my restaurants</span>
            <div className="detail-header">
              <div>
                <h1>{selectedRestaurant.name}</h1>
                <span className="cuisine">{selectedRestaurant.cuisine_type} · {selectedRestaurant.price_range}</span>
              </div>
              <button className="btn btn-danger" onClick={() => deleteRestaurant(selectedRestaurant.restaurant_id)}><Trash2 size={14} /> Delete</button>
            </div>

            <div className="tabs">
              <div className={`tab ${tab === 'tables' ? 'active' : ''}`} onClick={() => setTab('tables')}>Tables</div>
              <div className={`tab ${tab === 'timeslots' ? 'active' : ''}`} onClick={() => setTab('timeslots')}>Time Slots</div>
              <div className={`tab ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>Reservations</div>
            </div>

            {/* TABLES TAB */}
            {tab === 'tables' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Tables</h3>
                  <button className="btn btn-success btn-sm" onClick={() => setShowAddTable(true)}><Plus size={14} /> Add Table</button>
                </div>
                {tables.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Table #</th><th>Capacity</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {tables.map(t => (
                        <tr key={t.table_id}>
                          <td>Table {t.table_number}</td>
                          <td>{t.capacity} seats</td>
                          <td><span className={`badge ${t.is_occupied ? 'badge-cancelled' : 'badge-confirmed'}`}>{t.is_occupied ? 'Occupied' : 'Available'}</span></td>
                          <td><button className="btn btn-sm btn-danger" onClick={() => deleteTable(t.table_id)}><Trash2 size={12} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="empty-state"><p>No tables yet. Add your first table!</p></div>}

                {showAddTable && (
                  <div className="modal-overlay" onClick={() => setShowAddTable(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                      <h2>Add Table</h2>
                      <form onSubmit={addTable}>
                        <div className="form-group"><label>Table Number</label><input type="number" value={tableForm.table_number} onChange={e => setTableForm({...tableForm, table_number: e.target.value})} required /></div>
                        <div className="form-group"><label>Capacity (seats)</label><input type="number" value={tableForm.capacity} onChange={e => setTableForm({...tableForm, capacity: e.target.value})} required /></div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-primary">Add</button>
                          <button type="button" className="btn-secondary" onClick={() => setShowAddTable(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIMESLOTS TAB */}
            {tab === 'timeslots' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>Time Slots</h3>
                  <button className="btn btn-success btn-sm" onClick={() => setShowAddSlot(true)}><Plus size={14} /> Add Slot</button>
                </div>
                {timeslots.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Start</th><th>End</th><th>Status</th></tr></thead>
                    <tbody>
                      {timeslots.map(s => (
                        <tr key={s.slot_id}>
                          <td>{s.slot_start}</td>
                          <td>{s.slot_end}</td>
                          <td><span className={`badge ${s.is_open ? 'badge-confirmed' : 'badge-cancelled'}`}>{s.is_open ? 'Open' : 'Booked'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="empty-state"><p>No time slots yet</p></div>}

                {showAddSlot && (
                  <div className="modal-overlay" onClick={() => setShowAddSlot(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                      <h2>Add Time Slot</h2>
                      <form onSubmit={addTimeslot}>
                        <div className="form-group"><label>Start Time</label><input type="datetime-local" value={slotForm.slot_start} onChange={e => setSlotForm({...slotForm, slot_start: e.target.value})} required /></div>
                        <div className="form-group"><label>End Time</label><input type="datetime-local" value={slotForm.slot_end} onChange={e => setSlotForm({...slotForm, slot_end: e.target.value})} required /></div>
                        <div className="modal-actions">
                          <button type="submit" className="btn-primary">Add Slot</button>
                          <button type="button" className="btn-secondary" onClick={() => setShowAddSlot(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* RESERVATIONS TAB */}
            {tab === 'reservations' && (
              <div className="card">
                <h3>Reservations</h3>
                {reservations.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Customer</th><th>Party Size</th><th>Status</th><th>Date</th><th>Notes</th><th>Actions</th></tr></thead>
                    <tbody>
                      {reservations.map(r => (
                        <tr key={r.reservation_id}>
                          <td>{r.customer_name}</td>
                          <td>{r.party_size}</td>
                          <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                          <td>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td>{r.requests_notes_accommodation || '-'}</td>
                          <td>
                            <div className="btn-group">
                              {r.status === 'pending' && (
                                <>
                                  <button className="btn btn-sm btn-success" onClick={() => updateReservationStatus(r.reservation_id, 'confirmed')}>Confirm</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => updateReservationStatus(r.reservation_id, 'cancelled')}>Cancel</button>
                                </>
                              )}
                              {r.status === 'confirmed' && (
                                <>
                                  <button className="btn btn-sm btn-info" onClick={() => updateReservationStatus(r.reservation_id, 'completed')}>Complete</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => updateReservationStatus(r.reservation_id, 'cancelled')}>Cancel</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="empty-state"><p>No reservations yet</p></div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;
