from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, date, time
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Restaurant Table Booking System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = psycopg2.connect(
        host="localhost",
        database="restaurant_booking",
        user="postgres",
        password="devjanyani", 
        port=5432
    )
    return conn

def serialize_row(row):
    result = {}
    for key, value in row.items():
        if isinstance(value, (datetime, date, time)):
            result[key] = str(value)
        else:
            result[key] = value
    return result

def serialize_rows(rows):
    return [serialize_row(row) for row in rows]

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str

class CustomerLogin(BaseModel):
    email: str
    password: str

class OwnerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str

class OwnerLogin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class RestaurantCreate(BaseModel):
    owner_id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    cuisine_type: Optional[str] = None
    price_range: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    day_of_week: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_closed: Optional[bool] = False

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    cuisine_type: Optional[str] = None
    price_range: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    day_of_week: Optional[str] = None
    opening_time: Optional[str] = None
    closing_time: Optional[str] = None
    is_closed: Optional[bool] = None

class TableCreate(BaseModel):
    restaurant_id: int
    table_number: int
    capacity: int

class TimeslotCreate(BaseModel):
    restaurant_id: int
    slot_start: str
    slot_end: str

class ReservationCreate(BaseModel):
    customer_id: int
    restaurant_id: int
    table_id: Optional[int] = None
    slot_id: Optional[int] = None
    party_size: int
    requests_notes_accommodation: Optional[str] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    table_id: Optional[int] = None

class ReviewCreate(BaseModel):
    customer_id: int
    restaurant_id: int
    reservation_id: int
    rating: int
    comment: Optional[str] = None

class AdminActionCreate(BaseModel):
    admin_id: int
    restaurant_id: int
    action_type: str
    notes_explanation: Optional[str] = None

class PaymentCreate(BaseModel):
    reservation_id: int
    method_of_payment: str
    amount: float


@app.post("/api/customers/register")
def register_customer(customer: CustomerCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Customer WHERE email = %s", (customer.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cur.execute(
            "INSERT INTO Customer (name, email, phone, password) VALUES (%s, %s, %s, %s) RETURNING *",
            (customer.name, customer.email, customer.phone, customer.password)
        )
        new_customer = cur.fetchone()
        conn.commit()
        return serialize_row(new_customer)
    finally:
        cur.close()
        conn.close()

@app.post("/api/customers/login")
def login_customer(login: CustomerLogin):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Customer WHERE email = %s AND password = %s", (login.email, login.password))
        customer = cur.fetchone()
        if not customer:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return serialize_row(customer)
    finally:
        cur.close()
        conn.close()

@app.post("/api/owners/register")
def register_owner(owner: OwnerCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Owner WHERE email = %s", (owner.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        cur.execute(
            "INSERT INTO Owner (name, email, phone, password) VALUES (%s, %s, %s, %s) RETURNING *",
            (owner.name, owner.email, owner.phone, owner.password)
        )
        new_owner = cur.fetchone()
        conn.commit()
        return serialize_row(new_owner)
    finally:
        cur.close()
        conn.close()

@app.post("/api/owners/login")
def login_owner(login: OwnerLogin):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Owner WHERE email = %s AND password = %s", (login.email, login.password))
        owner = cur.fetchone()
        if not owner:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return serialize_row(owner)
    finally:
        cur.close()
        conn.close()

@app.post("/api/admins/login")
def login_admin(login: AdminLogin):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Admin WHERE email = %s AND password = %s", (login.email, login.password))
        admin = cur.fetchone()
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return serialize_row(admin)
    finally:
        cur.close()
        conn.close()


@app.get("/api/customers")
def get_customers():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT customer_id, name, email, phone, status, created_at FROM Customer")
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.get("/api/customers/{customer_id}")
def get_customer(customer_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT customer_id, name, email, phone, status, created_at FROM Customer WHERE customer_id = %s", (customer_id,))
        customer = cur.fetchone()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return serialize_row(customer)
    finally:
        cur.close()
        conn.close()

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("DELETE FROM Payment WHERE reservation_id IN (SELECT reservation_id FROM Reservation WHERE customer_id = %s)", (customer_id,))
        cur.execute("DELETE FROM Reviews WHERE customer_id = %s", (customer_id,))
        cur.execute("DELETE FROM Reservation WHERE customer_id = %s", (customer_id,))
        cur.execute("DELETE FROM Customer WHERE customer_id = %s", (customer_id,))
        conn.commit()
        return {"message": "Customer deleted"}
    finally:
        cur.close()
        conn.close()


@app.get("/api/owners")
def get_owners():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT owner_id, name, email, phone, status, created_at FROM Owner")
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()


@app.get("/api/restaurants")
def get_restaurants(city: Optional[str] = None, cuisine_type: Optional[str] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = "SELECT * FROM Restaurant WHERE 1=1"
        params = []
        if city:
            query += " AND LOWER(city) = LOWER(%s)"
            params.append(city)
        if cuisine_type:
            query += " AND LOWER(cuisine_type) = LOWER(%s)"
            params.append(cuisine_type)
        query += " ORDER BY name"
        cur.execute(query, params)
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.get("/api/restaurants/{restaurant_id}")
def get_restaurant(restaurant_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Restaurant WHERE restaurant_id = %s", (restaurant_id,))
        restaurant = cur.fetchone()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return serialize_row(restaurant)
    finally:
        cur.close()
        conn.close()

@app.get("/api/owners/{owner_id}/restaurants")
def get_owner_restaurants(owner_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Restaurant WHERE owner_id = %s ORDER BY name", (owner_id,))
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/restaurants")
def create_restaurant(restaurant: RestaurantCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """INSERT INTO Restaurant (owner_id, name, email, phone, cuisine_type, price_range, 
            description, address, city, state, country, postal_code, day_of_week, opening_time, closing_time, is_closed) 
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING *""",
            (restaurant.owner_id, restaurant.name, restaurant.email, restaurant.phone,
             restaurant.cuisine_type, restaurant.price_range, restaurant.description,
             restaurant.address, restaurant.city, restaurant.state, restaurant.country,
             restaurant.postal_code, restaurant.day_of_week, restaurant.opening_time,
             restaurant.closing_time, restaurant.is_closed)
        )
        new_restaurant = cur.fetchone()
        conn.commit()
        return serialize_row(new_restaurant)
    finally:
        cur.close()
        conn.close()

@app.put("/api/restaurants/{restaurant_id}")
def update_restaurant(restaurant_id: int, restaurant: RestaurantUpdate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Restaurant WHERE restaurant_id = %s", (restaurant_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        
        updates = {}
        for field, value in restaurant.dict(exclude_unset=True).items():
            if value is not None:
                updates[field] = value
        
        if not updates:
            return serialize_row(existing)
        
        set_clause = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values()) + [restaurant_id]
        
        cur.execute(f"UPDATE Restaurant SET {set_clause} WHERE restaurant_id = %s RETURNING *", values)
        updated = cur.fetchone()
        conn.commit()
        return serialize_row(updated)
    finally:
        cur.close()
        conn.close()

@app.delete("/api/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("DELETE FROM Payment WHERE reservation_id IN (SELECT reservation_id FROM Reservation WHERE restaurant_id = %s)", (restaurant_id,))
        cur.execute("DELETE FROM Reviews WHERE restaurant_id = %s", (restaurant_id,))
        cur.execute("DELETE FROM Reservation WHERE restaurant_id = %s", (restaurant_id,))
        cur.execute("DELETE FROM Admin_Action WHERE restaurant_id = %s", (restaurant_id,))
        cur.execute("DELETE FROM Timeslot WHERE restaurant_id = %s", (restaurant_id,))
        cur.execute("DELETE FROM Restaurant_Table WHERE restaurant_id = %s", (restaurant_id,))
        cur.execute("DELETE FROM Restaurant WHERE restaurant_id = %s", (restaurant_id,))
        conn.commit()
        return {"message": "Restaurant deleted"}
    finally:
        cur.close()
        conn.close()


@app.get("/api/restaurants/{restaurant_id}/tables")
def get_tables(restaurant_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Restaurant_Table WHERE restaurant_id = %s ORDER BY table_number", (restaurant_id,))
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/tables")
def create_table(table: TableCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO Restaurant_Table (restaurant_id, table_number, capacity) VALUES (%s, %s, %s) RETURNING *",
            (table.restaurant_id, table.table_number, table.capacity)
        )
        new_table = cur.fetchone()
        conn.commit()
        return serialize_row(new_table)
    finally:
        cur.close()
        conn.close()

@app.delete("/api/tables/{table_id}")
def delete_table(table_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("DELETE FROM Restaurant_Table WHERE table_id = %s", (table_id,))
        conn.commit()
        return {"message": "Table deleted"}
    finally:
        cur.close()
        conn.close()


@app.get("/api/restaurants/{restaurant_id}/timeslots")
def get_timeslots(restaurant_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Timeslot WHERE restaurant_id = %s ORDER BY slot_start", (restaurant_id,))
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/timeslots")
def create_timeslot(timeslot: TimeslotCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO Timeslot (restaurant_id, slot_start, slot_end) VALUES (%s, %s, %s) RETURNING *",
            (timeslot.restaurant_id, timeslot.slot_start, timeslot.slot_end)
        )
        new_slot = cur.fetchone()
        conn.commit()
        return serialize_row(new_slot)
    finally:
        cur.close()
        conn.close()

@app.delete("/api/timeslots/{slot_id}")
def delete_timeslot(slot_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("DELETE FROM Timeslot WHERE slot_id = %s", (slot_id,))
        conn.commit()
        return {"message": "Timeslot deleted"}
    finally:
        cur.close()
        conn.close()



@app.get("/api/reservations")
def get_reservations(customer_id: Optional[int] = None, restaurant_id: Optional[int] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        query = """SELECT r.*, c.name as customer_name, rest.name as restaurant_name 
                   FROM Reservation r 
                   JOIN Customer c ON r.customer_id = c.customer_id 
                   JOIN Restaurant rest ON r.restaurant_id = rest.restaurant_id 
                   WHERE 1=1"""
        params = []
        if customer_id:
            query += " AND r.customer_id = %s"
            params.append(customer_id)
        if restaurant_id:
            query += " AND r.restaurant_id = %s"
            params.append(restaurant_id)
        query += " ORDER BY r.created_at DESC"
        cur.execute(query, params)
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/reservations")
def create_reservation(reservation: ReservationCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if reservation.table_id:
            cur.execute("SELECT is_occupied FROM Restaurant_Table WHERE table_id = %s", (reservation.table_id,))
            table = cur.fetchone()
            if table and table['is_occupied']:
                raise HTTPException(status_code=400, detail="Table is already occupied")
        
        cur.execute(
            """INSERT INTO Reservation (customer_id, restaurant_id, table_id, slot_id, party_size, 
            status, assignment_method, requests_notes_accommodation) 
            VALUES (%s,%s,%s,%s,%s,'pending','auto',%s) RETURNING *""",
            (reservation.customer_id, reservation.restaurant_id, reservation.table_id,
             reservation.slot_id, reservation.party_size, reservation.requests_notes_accommodation)
        )
        new_reservation = cur.fetchone()
        
        if reservation.table_id:
            cur.execute("UPDATE Restaurant_Table SET is_occupied = TRUE WHERE table_id = %s", (reservation.table_id,))
        
        if reservation.slot_id:
            cur.execute("UPDATE Timeslot SET is_open = FALSE WHERE slot_id = %s", (reservation.slot_id,))
        
        conn.commit()
        return serialize_row(new_reservation)
    finally:
        cur.close()
        conn.close()

@app.put("/api/reservations/{reservation_id}")
def update_reservation(reservation_id: int, update: ReservationUpdate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Reservation WHERE reservation_id = %s", (reservation_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if update.status:
            cur.execute(
                "UPDATE Reservation SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = %s RETURNING *",
                (update.status, reservation_id)
            )
        
            if update.status == 'cancelled':
                cur.execute("UPDATE Reservation SET cancelled_at = CURRENT_TIMESTAMP WHERE reservation_id = %s", (reservation_id,))
                if existing['table_id']:
                    cur.execute("UPDATE Restaurant_Table SET is_occupied = FALSE WHERE table_id = %s", (existing['table_id'],))
                if existing['slot_id']:
                    cur.execute("UPDATE Timeslot SET is_open = TRUE WHERE slot_id = %s", (existing['slot_id'],))
            
            if update.status == 'completed':
                if existing['table_id']:
                    cur.execute("UPDATE Restaurant_Table SET is_occupied = FALSE WHERE table_id = %s", (existing['table_id'],))
        
        conn.commit()
        cur.execute("SELECT * FROM Reservation WHERE reservation_id = %s", (reservation_id,))
        return serialize_row(cur.fetchone())
    finally:
        cur.close()
        conn.close()

@app.delete("/api/reservations/{reservation_id}")
def delete_reservation(reservation_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM Reservation WHERE reservation_id = %s", (reservation_id,))
        existing = cur.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        if existing['table_id']:
            cur.execute("UPDATE Restaurant_Table SET is_occupied = FALSE WHERE table_id = %s", (existing['table_id'],))
        if existing['slot_id']:
            cur.execute("UPDATE Timeslot SET is_open = TRUE WHERE slot_id = %s", (existing['slot_id'],))
        
        cur.execute("DELETE FROM Payment WHERE reservation_id = %s", (reservation_id,))
        cur.execute("DELETE FROM Reviews WHERE reservation_id = %s", (reservation_id,))
        cur.execute("DELETE FROM Reservation WHERE reservation_id = %s", (reservation_id,))
        conn.commit()
        return {"message": "Reservation deleted"}
    finally:
        cur.close()
        conn.close()

@app.get("/api/payments")
def get_payments(reservation_id: Optional[int] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if reservation_id:
            cur.execute("SELECT * FROM Payment WHERE reservation_id = %s", (reservation_id,))
        else:
            cur.execute("SELECT * FROM Payment ORDER BY payment_id DESC")
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/payments")
def create_payment(payment: PaymentCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO Payment (reservation_id, method_of_payment, amount, payment_status) VALUES (%s,%s,%s,'pending') RETURNING *",
            (payment.reservation_id, payment.method_of_payment, payment.amount)
        )
        new_payment = cur.fetchone()
        conn.commit()
        return serialize_row(new_payment)
    finally:
        cur.close()
        conn.close()

@app.put("/api/payments/{payment_id}/complete")
def complete_payment(payment_id: int):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "UPDATE Payment SET payment_status = 'completed', paid_at = CURRENT_TIMESTAMP WHERE payment_id = %s RETURNING *",
            (payment_id,)
        )
        payment = cur.fetchone()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        conn.commit()
        return serialize_row(payment)
    finally:
        cur.close()
        conn.close()


@app.get("/api/reviews")
def get_reviews(restaurant_id: Optional[int] = None):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        if restaurant_id:
            cur.execute(
                """SELECT r.*, c.name as customer_name FROM Reviews r 
                JOIN Customer c ON r.customer_id = c.customer_id 
                WHERE r.restaurant_id = %s ORDER BY r.created_at DESC""",
                (restaurant_id,)
            )
        else:
            cur.execute(
                """SELECT r.*, c.name as customer_name FROM Reviews r 
                JOIN Customer c ON r.customer_id = c.customer_id 
                ORDER BY r.created_at DESC"""
            )
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/reviews")
def create_review(review: ReviewCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT status FROM Reservation WHERE reservation_id = %s", (review.reservation_id,))
        reservation = cur.fetchone()
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        if reservation['status'] != 'completed':
            raise HTTPException(status_code=400, detail="Can only review completed reservations")
        
        cur.execute("SELECT * FROM Reviews WHERE reservation_id = %s", (review.reservation_id,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Reservation already reviewed")
        
        cur.execute(
            "INSERT INTO Reviews (customer_id, restaurant_id, reservation_id, rating, comment) VALUES (%s,%s,%s,%s,%s) RETURNING *",
            (review.customer_id, review.restaurant_id, review.reservation_id, review.rating, review.comment)
        )
        new_review = cur.fetchone()
        conn.commit()
        return serialize_row(new_review)
    finally:
        cur.close()
        conn.close()


@app.get("/api/admins")
def get_admins():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT admin_id, name, email, phone, status, created_at FROM Admin")
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.get("/api/admin-actions")
def get_admin_actions():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """SELECT aa.*, a.name as admin_name, r.name as restaurant_name 
            FROM Admin_Action aa 
            JOIN Admin a ON aa.admin_id = a.admin_id 
            JOIN Restaurant r ON aa.restaurant_id = r.restaurant_id 
            ORDER BY aa.created_at DESC"""
        )
        return serialize_rows(cur.fetchall())
    finally:
        cur.close()
        conn.close()

@app.post("/api/admin-actions")
def create_admin_action(action: AdminActionCreate):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO Admin_Action (admin_id, restaurant_id, action_type, notes_explanation) VALUES (%s,%s,%s,%s) RETURNING *",
            (action.admin_id, action.restaurant_id, action.action_type, action.notes_explanation)
        )
        new_action = cur.fetchone()
        conn.commit()
        return serialize_row(new_action)
    finally:
        cur.close()
        conn.close()


@app.get("/api/stats")
def get_stats():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        stats = {}
        cur.execute("SELECT COUNT(*) as count FROM Customer")
        stats['total_customers'] = cur.fetchone()['count']
        cur.execute("SELECT COUNT(*) as count FROM Restaurant")
        stats['total_restaurants'] = cur.fetchone()['count']
        cur.execute("SELECT COUNT(*) as count FROM Reservation")
        stats['total_reservations'] = cur.fetchone()['count']
        cur.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'pending'")
        stats['pending_reservations'] = cur.fetchone()['count']
        cur.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'confirmed'")
        stats['confirmed_reservations'] = cur.fetchone()['count']
        cur.execute("SELECT COUNT(*) as count FROM Reservation WHERE status = 'completed'")
        stats['completed_reservations'] = cur.fetchone()['count']
        cur.execute("SELECT COALESCE(SUM(amount), 0) as total FROM Payment WHERE payment_status = 'completed'")
        stats['total_revenue'] = float(cur.fetchone()['total'])
        cur.execute("SELECT COUNT(*) as count FROM Reviews")
        stats['total_reviews'] = cur.fetchone()['count']
        return stats
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
