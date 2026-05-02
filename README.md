# Restaurant Table Booking System

**CSE 412 — Team 40**
Devendra Janyani · Kushagra Srivastava · Sanyam Jaiswal · Yugant Vijay Popkar

A full-stack web application for booking restaurant tables. Built on top of the database schema designed in Phase 1 (ER) and Phase 2 (Relational + DDL).

- **Backend:** FastAPI + psycopg2 + PostgreSQL
- **Frontend:** React (Create React App) + Axios + React Router + lucide-react
- **Database:** PostgreSQL 15+

---

## Project structure

```
restaurant-booking-system/
├── backend/
│   └── main.py                       # FastAPI app, all REST endpoints
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Top-level router, role gating
│   │   ├── api.js                    # Axios client (baseURL: localhost:8000/api)
│   │   ├── App.css                   # Shared styles
│   │   └── pages/
│   │       ├── Login.js              # Customer / Owner / Admin login + register
│   │       ├── CustomerDashboard.js  # Browse, book, review
│   │       ├── OwnerDashboard.js     # Manage restaurants, tables, slots, reservations
│   │       └── AdminDashboard.js     # Stats, moderation, audit log
│   ├── public/
│   └── package.json
└── restaurant_booking_dump.sql       # Schema + seed data (pg_dump format)
```

---

## Database schema

10 tables, mapped 1-to-1 from the ER diagram in Phase 1:

| Table | Primary Key | Foreign Keys |
|---|---|---|
| `customer` | `customer_id` | — |
| `owner` | `owner_id` | — |
| `admin` | `admin_id` | — |
| `restaurant` | `restaurant_id` | `owner_id` → owner |
| `restaurant_table` | `table_id` | `restaurant_id` |
| `timeslot` | `slot_id` | `restaurant_id` |
| `reservation` | `reservation_id` | `customer_id`, `restaurant_id`, `table_id`, `slot_id` |
| `payment` | `payment_id` | `reservation_id` |
| `reviews` | `review_id` | `customer_id`, `restaurant_id`, `reservation_id` |
| `admin_action` | `action_id` | `admin_id`, `restaurant_id` |

Full DDL with column types and constraints is in `restaurant_booking_dump.sql`.

---

## Setup & run

### 1. Database

Requires PostgreSQL 15+ running locally on port 5432 with a `postgres` superuser.

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE restaurant_booking;"

# Load schema + seed data
psql -U postgres -d restaurant_booking -f restaurant_booking_dump.sql
```

After loading you should see 10 tables and the seed data:

```bash
psql -U postgres -d restaurant_booking -c "\dt"
psql -U postgres -d restaurant_booking -c "SELECT COUNT(*) FROM customer;"   # 10
psql -U postgres -d restaurant_booking -c "SELECT COUNT(*) FROM restaurant;" # 7
```

### 2. Backend (FastAPI)

```bash
cd backend
pip install fastapi uvicorn psycopg2-binary pydantic
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API is now reachable at `http://localhost:8000`. Interactive Swagger docs are auto-generated at `http://localhost:8000/docs`.

> **Note:** the database connection settings (host, user, password, port) are at the top of `backend/main.py` in `get_db()`. Update the `password` field to match your local Postgres password before starting the server.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm start
```

Opens `http://localhost:3000`. The frontend talks to the backend at `http://localhost:8000/api` (configured in `src/api.js`).

---

## Demo credentials

The seed data in `restaurant_booking_dump.sql` includes the following pre-loaded accounts you can log in with:

| Role | Email | Password |
|---|---|---|
| Customer | `alice@email.com` | `pass123` |
| Customer | `bob@email.com` | `pass456` |
| Owner | `marco@email.com` | `owner123` |
| Owner | `sarah@email.com` | `owner456` |
| Admin | `admin1@email.com` | `admin123` |

(All 10 customers, 5 owners, and 3 admins are listed in the seed data — same email pattern, see the dump.)

---

## Features

### Customer
- Register a new account / log in
- Browse all restaurants, filter by city and cuisine
- View restaurant details: tables, time slots, reviews
- Book a table (choose table + time slot, or auto-assign)
- Cancel own pending / confirmed reservations
- Write a 1–5 star review for completed reservations

### Owner
- Register / log in
- Add and delete restaurants
- Manage tables (add / delete) per restaurant
- Manage time slots (add / list) per restaurant
- View reservations for own restaurants
- Confirm pending reservations, mark confirmed reservations as completed, or cancel

### Admin
- Log in to a moderation dashboard
- Platform-wide stats: customers, restaurants, reservations by status, total revenue, total reviews
- View all customers, owners, restaurants, reservations, reviews
- Delete customers (cascade deletes their reservations, reviews, payments)
- Delete restaurants (cascade deletes related rows)
- Perform admin actions on a restaurant (approve / suspend / unsuspend / delete) with a notes/explanation field
- Audit log of every admin action

### Business rules enforced by the backend
- A customer can only review a reservation whose status is `completed`.
- A reservation can only be reviewed once.
- Booking a table marks `restaurant_table.is_occupied = TRUE` and `timeslot.is_open = FALSE`.
- Cancelling or completing a reservation frees the table back to `is_occupied = FALSE`.
- Cancellation also re-opens the time slot.
- Email is unique per customer / owner / admin.
- Rating values are constrained to 1–5 by a `CHECK` constraint.

---

## API summary

All endpoints are under `/api`. JSON request/response bodies. CORS is open for local development.

### Auth
- `POST /api/customers/register` — create a customer account
- `POST /api/customers/login`
- `POST /api/owners/register`
- `POST /api/owners/login`
- `POST /api/admins/login`

### Customers / Owners / Admins
- `GET /api/customers` · `GET /api/customers/{id}` · `DELETE /api/customers/{id}`
- `GET /api/owners` · `GET /api/owners/{id}/restaurants`
- `GET /api/admins`

### Restaurants
- `GET /api/restaurants?city=...&cuisine_type=...`
- `GET /api/restaurants/{id}`
- `POST /api/restaurants`
- `PUT /api/restaurants/{id}`
- `DELETE /api/restaurants/{id}`

### Tables
- `GET /api/restaurants/{id}/tables`
- `POST /api/tables`
- `DELETE /api/tables/{id}`

### Time slots
- `GET /api/restaurants/{id}/timeslots`
- `POST /api/timeslots`
- `DELETE /api/timeslots/{id}`

### Reservations
- `GET /api/reservations?customer_id=...&restaurant_id=...`
- `POST /api/reservations`
- `PUT /api/reservations/{id}` — used for `status` transitions (`confirmed`, `completed`, `cancelled`)
- `DELETE /api/reservations/{id}`

### Payments
- `GET /api/payments?reservation_id=...`
- `POST /api/payments`
- `PUT /api/payments/{id}/complete`

### Reviews
- `GET /api/reviews?restaurant_id=...`
- `POST /api/reviews`

### Admin actions
- `GET /api/admin-actions`
- `POST /api/admin-actions`

### Stats
- `GET /api/stats` — counts and totals for the admin dashboard

---

## Tech notes

- **Phase alignment:** the column names, types, and FK relationships in `restaurant_booking_dump.sql` are an exact match to the DDL in the Phase 2 midterm report.
- **Cascade handling:** because the original DDL did not declare `ON DELETE CASCADE`, the backend manually deletes child rows in the correct order (Payment → Reviews → Reservation → Restaurant_Table → Timeslot → Restaurant) inside delete endpoints.
- **Auto-vs-manual assignment:** the `Reservation.assignment_method` column defaults to `'auto'`. The customer UI lets the user pick a specific table/slot or leave them blank for auto-assign.
- **Default port:** backend on `:8000`, frontend on `:3000`. To change the API base URL, edit `frontend/src/api.js`.

---

## Team contributions

Listed alphabetically. (Team to update with specific responsibilities before final submission.)

- **Devendra Janyani** —
- **Kushagra Srivastava** —
- **Sanyam Jaiswal** —
- **Yugant Vijay Popkar** —

---

## Demo video

YouTube link: *to be added*
