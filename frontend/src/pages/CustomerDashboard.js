import React, { useState, useEffect } from 'react';
import API from '../api';
import { Search, CalendarDays, Star, MapPin, Clock, Users, UtensilsCrossed, LogOut, Home, BookOpen, MessageSquare } from 'lucide-react';

function CustomerDashboard({ user, onLogout }) {
  const [page, setPage] = useState('browse');
  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ city: '', cuisine: '' });
  const [bookingForm, setBookingForm] = useState({ table_id: '', slot_id: '', party_size: '', notes: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewingReservation, setReviewingReservation] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { loadRestaurants(); loadReservations(); }, []);

  const loadRestaurants = async () => {
    try {
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.cuisine) params.cuisine_type = filters.cuisine;
      const res = await API.get('/restaurants', { params });
      setRestaurants(res.data);
    } catch (err) { console.error(err); }
  };

  const loadReservations = async () => {
    try {
      const res = await API.get('/reservations', { params: { customer_id: user.customer_id } });
      setReservations(res.data);
    } catch (err) { console.error(err); }
  };

  const viewRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    try {
      const [tablesRes, slotsRes, reviewsRes] = await Promise.all([
        API.get(`/restaurants/${restaurant.restaurant_id}/tables`),
        API.get(`/restaurants/${restaurant.restaurant_id}/timeslots`),
        API.get('/reviews', { params: { restaurant_id: restaurant.restaurant_id } })
      ]);
      setTables(tablesRes.data);
      setTimeslots(slotsRes.data);
      setReviews(reviewsRes.data);
    } catch (err) { console.error(err); }
    setPage('restaurant-detail');
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reservations', {
        customer_id: user.customer_id,
        restaurant_id: selectedRestaurant.restaurant_id,
        table_id: bookingForm.table_id ? parseInt(bookingForm.table_id) : null,
        slot_id: bookingForm.slot_id ? parseInt(bookingForm.slot_id) : null,
        party_size: parseInt(bookingForm.party_size),
        requests_notes_accommodation: bookingForm.notes || null
      });
      setMessage({ type: 'success', text: 'Reservation created successfully!' });
      setShowBooking(false);
      setBookingForm({ table_id: '', slot_id: '', party_size: '', notes: '' });
      loadReservations();
      // Reload tables/slots
      const [tablesRes, slotsRes] = await Promise.all([
        API.get(`/restaurants/${selectedRestaurant.restaurant_id}/tables`),
        API.get(`/restaurants/${selectedRestaurant.restaurant_id}/timeslots`)
      ]);
      setTables(tablesRes.data);
      setTimeslots(slotsRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Booking failed' });
    }
  };

  const cancelReservation = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await API.put(`/reservations/${id}`, { status: 'cancelled' });
      setMessage({ type: 'success', text: 'Reservation cancelled' });
      loadReservations();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel reservation' });
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await API.post('/reviews', {
        customer_id: user.customer_id,
        restaurant_id: reviewingReservation.restaurant_id,
        reservation_id: reviewingReservation.reservation_id,
        rating: parseInt(reviewForm.rating),
        comment: reviewForm.comment
      });
      setMessage({ type: 'success', text: 'Review submitted!' });
      setReviewingReservation(null);
      setReviewForm({ rating: 5, comment: '' });
      loadReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to submit review' });
    }
  };

  useEffect(() => { if (message.text) { const t = setTimeout(() => setMessage({ type: '', text: '' }), 3000); return () => clearTimeout(t); } }, [message]);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>🍽️ Restaurant Booking</h2>
          <p>Welcome, {user.name}</p>
        </div>
        <ul className="sidebar-nav">
          <li className={page === 'browse' ? 'active' : ''} onClick={() => { setPage('browse'); setSelectedRestaurant(null); }}>
            <Search size={18} /> Browse Restaurants
          </li>
          <li className={page === 'reservations' ? 'active' : ''} onClick={() => setPage('reservations')}>
            <CalendarDays size={18} /> My Reservations
          </li>
        </ul>
        <button className="logout-btn" onClick={onLogout}><LogOut size={14} /> Log Out</button>
      </div>

      <div className="main-content">
        {message.text && <div className={message.type === 'error' ? 'error-msg' : 'success-msg'}>{message.text}</div>}

        {/* BROWSE RESTAURANTS */}
        {page === 'browse' && !selectedRestaurant && (
          <>
            <div className="page-header">
              <h1>Browse Restaurants</h1>
              <p>Find and book your perfect dining experience</p>
            </div>
            <div className="filters">
              <input placeholder="Filter by city..." value={filters.city} onChange={e => setFilters({...filters, city: e.target.value})} />
              <input placeholder="Filter by cuisine..." value={filters.cuisine} onChange={e => setFilters({...filters, cuisine: e.target.value})} />
              <button className="btn btn-info" onClick={loadRestaurants}>Search</button>
            </div>
            <div className="restaurant-grid">
              {restaurants.map(r => (
                <div key={r.restaurant_id} className="restaurant-card" onClick={() => viewRestaurant(r)}>
                  <h3>{r.name}</h3>
                  <span className="cuisine">{r.cuisine_type}</span>
                  <div className="info-row"><MapPin size={14} /> {r.address}, {r.city}</div>
                  <div className="info-row"><Clock size={14} /> {r.opening_time} - {r.closing_time} ({r.day_of_week})</div>
                  <div className="info-row"><span className="price">{r.price_range}</span></div>
                  {r.is_closed && <span className="badge badge-cancelled">Closed</span>}
                </div>
              ))}
              {restaurants.length === 0 && <div className="empty-state"><h3>No restaurants found</h3><p>Try adjusting your filters</p></div>}
            </div>
          </>
        )}

        {/* RESTAURANT DETAIL */}
        {page === 'restaurant-detail' && selectedRestaurant && (
          <>
            <span className="back-btn" onClick={() => { setPage('browse'); setSelectedRestaurant(null); }}>← Back to restaurants</span>
            <div className="detail-header">
              <div>
                <h1>{selectedRestaurant.name}</h1>
                <span className="cuisine">{selectedRestaurant.cuisine_type}</span>
              </div>
              <button className="btn btn-success" onClick={() => setShowBooking(true)}>Book a Table</button>
            </div>
            <div className="card">
              <div className="detail-info">
                <div className="info-item"><span className="label">Address</span><div className="value">{selectedRestaurant.address}, {selectedRestaurant.city}, {selectedRestaurant.state}</div></div>
                <div className="info-item"><span className="label">Hours</span><div className="value">{selectedRestaurant.opening_time} - {selectedRestaurant.closing_time}</div></div>
                <div className="info-item"><span className="label">Phone</span><div className="value">{selectedRestaurant.phone}</div></div>
                <div className="info-item"><span className="label">Price Range</span><div className="value">{selectedRestaurant.price_range}</div></div>
                <div className="info-item"><span className="label">Day</span><div className="value">{selectedRestaurant.day_of_week}</div></div>
                <div className="info-item"><span className="label">Email</span><div className="value">{selectedRestaurant.email}</div></div>
              </div>
              <p>{selectedRestaurant.description}</p>
            </div>

            {/* Tables */}
            <div className="card">
              <h3>Available Tables</h3>
              {tables.length > 0 ? (
                <table className="data-table">
                  <thead><tr><th>Table #</th><th>Capacity</th><th>Status</th></tr></thead>
                  <tbody>
                    {tables.map(t => (
                      <tr key={t.table_id}>
                        <td>Table {t.table_number}</td>
                        <td><Users size={14} /> {t.capacity} seats</td>
                        <td><span className={`badge ${t.is_occupied ? 'badge-cancelled' : 'badge-confirmed'}`}>{t.is_occupied ? 'Occupied' : 'Available'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="empty-state"><p>No tables listed</p></div>}
            </div>

            {/* Reviews */}
            <div className="card">
              <h3>Reviews</h3>
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

            {/* BOOKING MODAL */}
            {showBooking && (
              <div className="modal-overlay" onClick={() => setShowBooking(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h2>Book a Table at {selectedRestaurant.name}</h2>
                  <form onSubmit={handleBooking}>
                    <div className="form-group">
                      <label>Party Size *</label>
                      <input type="number" min="1" max="20" value={bookingForm.party_size} onChange={e => setBookingForm({...bookingForm, party_size: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Select Table</label>
                      <select value={bookingForm.table_id} onChange={e => setBookingForm({...bookingForm, table_id: e.target.value})}>
                        <option value="">Auto-assign</option>
                        {tables.filter(t => !t.is_occupied).map(t => (
                          <option key={t.table_id} value={t.table_id}>Table {t.table_number} ({t.capacity} seats)</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Select Time Slot</label>
                      <select value={bookingForm.slot_id} onChange={e => setBookingForm({...bookingForm, slot_id: e.target.value})}>
                        <option value="">No preference</option>
                        {timeslots.filter(s => s.is_open).map(s => (
                          <option key={s.slot_id} value={s.slot_id}>{s.slot_start} - {s.slot_end}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Special Requests</label>
                      <textarea rows="3" value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} placeholder="Allergies, seating preferences, etc." />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="btn-primary">Confirm Booking</button>
                      <button type="button" className="btn-secondary" onClick={() => setShowBooking(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {/* MY RESERVATIONS */}
        {page === 'reservations' && (
          <>
            <div className="page-header">
              <h1>My Reservations</h1>
              <p>View and manage your bookings</p>
            </div>
            <div className="card">
              {reservations.length > 0 ? (
                <table className="data-table">
                  <thead><tr><th>Restaurant</th><th>Party Size</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.reservation_id}>
                        <td>{r.restaurant_name}</td>
                        <td><Users size={14} /> {r.party_size}</td>
                        <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group">
                            {(r.status === 'pending' || r.status === 'confirmed') && (
                              <button className="btn btn-sm btn-danger" onClick={() => cancelReservation(r.reservation_id)}>Cancel</button>
                            )}
                            {r.status === 'completed' && (
                              <button className="btn btn-sm btn-info" onClick={() => setReviewingReservation(r)}>Write Review</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <div className="empty-state"><h3>No reservations yet</h3><p>Browse restaurants to make your first booking!</p></div>}
            </div>

            {/* REVIEW MODAL */}
            {reviewingReservation && (
              <div className="modal-overlay" onClick={() => setReviewingReservation(null)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h2>Review {reviewingReservation.restaurant_name}</h2>
                  <form onSubmit={submitReview}>
                    <div className="form-group">
                      <label>Rating</label>
                      <select value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: e.target.value})}>
                        <option value="5">★★★★★ Excellent</option>
                        <option value="4">★★★★☆ Good</option>
                        <option value="3">★★★☆☆ Average</option>
                        <option value="2">★★☆☆☆ Below Average</option>
                        <option value="1">★☆☆☆☆ Poor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Comment</label>
                      <textarea rows="4" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="Share your experience..." />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="btn-primary">Submit Review</button>
                      <button type="button" className="btn-secondary" onClick={() => setReviewingReservation(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CustomerDashboard;
