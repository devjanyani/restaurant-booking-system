\restrict oa6Seg6Y6Pa3yWZklCMEib1RJxC16vUaMCyAbcw8YwVEwOA1j9MKbQwI2NFa7j6


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin OWNER TO postgres;


CREATE TABLE public.admin_action (
    action_id integer NOT NULL,
    admin_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    action_type character varying(20) NOT NULL,
    notes_explanation text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_action OWNER TO postgres;


CREATE SEQUENCE public.admin_action_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_action_action_id_seq OWNER TO postgres;


ALTER SEQUENCE public.admin_action_action_id_seq OWNED BY public.admin_action.action_id;


CREATE SEQUENCE public.admin_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_admin_id_seq OWNER TO postgres;


ALTER SEQUENCE public.admin_admin_id_seq OWNED BY public.admin.admin_id;


CREATE TABLE public.customer (
    customer_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer OWNER TO postgres;


CREATE SEQUENCE public.customer_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_customer_id_seq OWNER TO postgres;


ALTER SEQUENCE public.customer_customer_id_seq OWNED BY public.customer.customer_id;



CREATE TABLE public.owner (
    owner_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20),
    password character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.owner OWNER TO postgres;


CREATE SEQUENCE public.owner_owner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_owner_id_seq OWNER TO postgres;


ALTER SEQUENCE public.owner_owner_id_seq OWNED BY public.owner.owner_id;



CREATE TABLE public.payment (
    payment_id integer NOT NULL,
    reservation_id integer NOT NULL,
    method_of_payment character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    paid_at timestamp without time zone
);


ALTER TABLE public.payment OWNER TO postgres;


CREATE SEQUENCE public.payment_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_payment_id_seq OWNER TO postgres;


ALTER SEQUENCE public.payment_payment_id_seq OWNED BY public.payment.payment_id;



CREATE TABLE public.reservation (
    reservation_id integer NOT NULL,
    customer_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    table_id integer,
    slot_id integer,
    party_size integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    assignment_method character varying(10) DEFAULT 'auto'::character varying,
    requests_notes_accommodation text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    cancelled_at timestamp without time zone
);


ALTER TABLE public.reservation OWNER TO postgres;


CREATE SEQUENCE public.reservation_reservation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservation_reservation_id_seq OWNER TO postgres;

ALTER SEQUENCE public.reservation_reservation_id_seq OWNED BY public.reservation.reservation_id;


CREATE TABLE public.restaurant (
    restaurant_id integer NOT NULL,
    owner_id integer NOT NULL,
    name character varying(150) NOT NULL,
    email character varying(150),
    phone character varying(20),
    cuisine_type character varying(100),
    price_range character varying(10),
    description text,
    address character varying(255),
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    day_of_week character varying(15),
    opening_time time without time zone,
    closing_time time without time zone,
    is_closed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.restaurant OWNER TO postgres;


CREATE SEQUENCE public.restaurant_restaurant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_restaurant_id_seq OWNER TO postgres;

ALTER SEQUENCE public.restaurant_restaurant_id_seq OWNED BY public.restaurant.restaurant_id;


CREATE TABLE public.restaurant_table (
    table_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    table_number integer NOT NULL,
    capacity integer NOT NULL,
    is_occupied boolean DEFAULT false
);


ALTER TABLE public.restaurant_table OWNER TO postgres;

CREATE SEQUENCE public.restaurant_table_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restaurant_table_table_id_seq OWNER TO postgres;

ALTER SEQUENCE public.restaurant_table_table_id_seq OWNED BY public.restaurant_table.table_id;



CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    customer_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    reservation_id integer NOT NULL,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;


CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO postgres;



ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;



CREATE TABLE public.timeslot (
    slot_id integer NOT NULL,
    restaurant_id integer NOT NULL,
    slot_start timestamp without time zone NOT NULL,
    slot_end timestamp without time zone NOT NULL,
    is_open boolean DEFAULT true
);


ALTER TABLE public.timeslot OWNER TO postgres;



CREATE SEQUENCE public.timeslot_slot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timeslot_slot_id_seq OWNER TO postgres;



ALTER SEQUENCE public.timeslot_slot_id_seq OWNED BY public.timeslot.slot_id;



ALTER TABLE ONLY public.admin ALTER COLUMN admin_id SET DEFAULT nextval('public.admin_admin_id_seq'::regclass);



ALTER TABLE ONLY public.admin_action ALTER COLUMN action_id SET DEFAULT nextval('public.admin_action_action_id_seq'::regclass);


ALTER TABLE ONLY public.customer ALTER COLUMN customer_id SET DEFAULT nextval('public.customer_customer_id_seq'::regclass);


ALTER TABLE ONLY public.owner ALTER COLUMN owner_id SET DEFAULT nextval('public.owner_owner_id_seq'::regclass);



ALTER TABLE ONLY public.payment ALTER COLUMN payment_id SET DEFAULT nextval('public.payment_payment_id_seq'::regclass);


ALTER TABLE ONLY public.reservation ALTER COLUMN reservation_id SET DEFAULT nextval('public.reservation_reservation_id_seq'::regclass);



ALTER TABLE ONLY public.restaurant ALTER COLUMN restaurant_id SET DEFAULT nextval('public.restaurant_restaurant_id_seq'::regclass);



ALTER TABLE ONLY public.restaurant_table ALTER COLUMN table_id SET DEFAULT nextval('public.restaurant_table_table_id_seq'::regclass);



ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);



ALTER TABLE ONLY public.timeslot ALTER COLUMN slot_id SET DEFAULT nextval('public.timeslot_slot_id_seq'::regclass);



COPY public.admin (admin_id, name, email, phone, password, status, created_at) FROM stdin;
1	Admin One	admin1@email.com	623-555-0301	admin123	active	2026-03-27 12:59:56.780714
2	Admin Two	admin2@email.com	623-555-0302	admin456	active	2026-03-27 12:59:56.780714
3	Admin Three	admin3@email.com	623-555-0303	admin789	active	2026-03-27 12:59:56.780714
\.



COPY public.admin_action (action_id, admin_id, restaurant_id, action_type, notes_explanation, created_at) FROM stdin;
1	1	1	approve	Restaurant listing verified and approved.	2026-03-27 12:59:56.780714
2	1	3	approve	All documents verified.	2026-03-27 12:59:56.780714
3	2	5	approve	Approved after inspection.	2026-03-27 12:59:56.780714
4	2	6	approve	Listing looks good.	2026-03-27 12:59:56.780714
5	3	7	approve	Approved for platform.	2026-03-27 12:59:56.780714
6	1	4	suspend	Received multiple hygiene complaints. Suspended pending review.	2026-03-27 12:59:56.780714
\.



COPY public.customer (customer_id, name, email, phone, password, status, created_at) FROM stdin;
1	Alice Johnson	alice@email.com	480-555-0101	pass123	active	2026-03-27 12:59:56.780714
2	Bob Smith	bob@email.com	480-555-0102	pass456	active	2026-03-27 12:59:56.780714
3	Charlie Brown	charlie@email.com	480-555-0103	pass789	active	2026-03-27 12:59:56.780714
4	Diana Ross	diana@email.com	480-555-0104	pass321	active	2026-03-27 12:59:56.780714
5	Edward Lee	edward@email.com	480-555-0105	pass654	active	2026-03-27 12:59:56.780714
6	Fiona Garcia	fiona@email.com	480-555-0106	pass987	active	2026-03-27 12:59:56.780714
7	George Wang	george@email.com	480-555-0107	pass111	inactive	2026-03-27 12:59:56.780714
8	Hannah Kim	hannah@email.com	480-555-0108	pass222	active	2026-03-27 12:59:56.780714
9	Ivan Petrov	ivan@email.com	480-555-0109	pass333	active	2026-03-27 12:59:56.780714
10	Julia Chen	julia@email.com	480-555-0110	pass444	active	2026-03-27 12:59:56.780714
\.


COPY public.owner (owner_id, name, email, phone, password, status, created_at) FROM stdin;
1	Marco Rossi	marco@email.com	602-555-0201	owner123	active	2026-03-27 12:59:56.780714
2	Sarah Patel	sarah@email.com	602-555-0202	owner456	active	2026-03-27 12:59:56.780714
3	Kenji Tanaka	kenji@email.com	602-555-0203	owner789	active	2026-03-27 12:59:56.780714
4	Maria Lopez	maria@email.com	602-555-0204	owner321	active	2026-03-27 12:59:56.780714
5	David Kim	david@email.com	602-555-0205	owner654	active	2026-03-27 12:59:56.780714
\.



COPY public.payment (payment_id, reservation_id, method_of_payment, amount, payment_status, paid_at) FROM stdin;
1	1	credit_card	45.99	completed	2025-04-01 12:30:00
2	2	credit_card	89.50	completed	2025-04-01 13:45:00
3	3	debit_card	0.00	refunded	2025-03-26 15:30:00
4	4	cash	32.00	pending	\N
5	5	credit_card	55.75	pending	\N
6	6	credit_card	28.50	completed	2025-04-01 10:30:00
7	7	debit_card	72.00	completed	2025-03-25 20:00:00
8	8	credit_card	95.00	pending	\N
9	9	cash	40.00	pending	\N
10	10	credit_card	50.00	failed	\N
\.



COPY public.reservation (reservation_id, customer_id, restaurant_id, table_id, slot_id, party_size, status, assignment_method, requests_notes_accommodation, created_at, updated_at, cancelled_at) FROM stdin;
2	2	1	2	2	4	completed	manual	Window seat please	2025-03-27 09:00:00	2025-03-27 09:10:00	\N
3	3	1	3	3	5	cancelled	auto	\N	2025-03-26 14:00:00	2025-03-26 15:00:00	2025-03-26 15:00:00
4	4	3	5	4	2	confirmed	auto	Vegetarian options needed	2025-03-28 11:00:00	2025-03-28 11:05:00	\N
5	5	5	8	6	3	pending	auto	\N	2025-03-29 08:00:00	\N	\N
6	6	6	10	8	2	confirmed	manual	Birthday celebration	2025-03-28 12:00:00	2025-03-28 12:10:00	\N
7	7	7	14	10	4	completed	auto	\N	2025-03-25 16:00:00	2025-03-25 16:05:00	\N
8	8	7	15	11	6	confirmed	auto	Allergic to peanuts	2025-03-28 17:00:00	2025-03-28 17:05:00	\N
9	9	3	6	5	4	pending	manual	\N	2025-03-29 09:00:00	\N	\N
10	10	5	9	7	2	no_show	auto	\N	2025-03-27 18:00:00	2025-03-27 20:00:00	\N
1	1	1	1	1	2	confirmed	auto	\N	2025-03-28 10:00:00	2026-03-28 13:59:25.338796	\N
\.



COPY public.restaurant (restaurant_id, owner_id, name, email, phone, cuisine_type, price_range, description, address, city, state, country, postal_code, day_of_week, opening_time, closing_time, is_closed, created_at) FROM stdin;
1	1	Bella Italia	bella@rest.com	480-600-0001	Italian	$$$	Authentic Italian dining experience	100 Mill Ave	Tempe	Arizona	USA	85281	Monday	11:00:00	22:00:00	f	2026-03-27 12:59:56.780714
2	1	Bella Italia	bella@rest.com	480-600-0001	Italian	$$$	Authentic Italian dining experience	100 Mill Ave	Tempe	Arizona	USA	85281	Tuesday	11:00:00	22:00:00	f	2026-03-27 12:59:56.780714
3	2	Spice Garden	spice@rest.com	480-600-0002	Indian	$$	Traditional Indian flavors	200 Apache Blvd	Tempe	Arizona	USA	85282	Monday	10:00:00	21:00:00	f	2026-03-27 12:59:56.780714
4	2	Spice Garden	spice@rest.com	480-600-0002	Indian	$$	Traditional Indian flavors	200 Apache Blvd	Tempe	Arizona	USA	85282	Sunday	10:00:00	21:00:00	t	2026-03-27 12:59:56.780714
5	3	Tokyo Ramen	tokyo@rest.com	480-600-0003	Japanese	$$	Best ramen in town	300 University Dr	Tempe	Arizona	USA	85283	Monday	11:30:00	23:00:00	f	2026-03-27 12:59:56.780714
6	4	Taco Fiesta	taco@rest.com	480-600-0004	Mexican	$	Casual Mexican street food	400 Rural Rd	Scottsdale	Arizona	USA	85251	Monday	09:00:00	20:00:00	f	2026-03-27 12:59:56.780714
7	5	Seoul BBQ	seoul@rest.com	480-600-0005	Korean	$$$	Premium Korean BBQ	500 Scottsdale Rd	Scottsdale	Arizona	USA	85252	Monday	12:00:00	22:00:00	f	2026-03-27 12:59:56.780714
\.



COPY public.restaurant_table (table_id, restaurant_id, table_number, capacity, is_occupied) FROM stdin;
1	1	1	2	f
2	1	2	4	f
3	1	3	6	t
4	1	4	8	f
5	3	1	2	f
6	3	2	4	f
7	3	3	4	t
8	5	1	2	f
9	5	2	4	f
10	6	1	4	f
11	6	2	4	f
12	7	1	2	f
13	7	2	4	f
15	7	4	6	f
16	7	5	8	f
14	7	3	4	f
\.



COPY public.reviews (review_id, customer_id, restaurant_id, reservation_id, rating, comment, created_at) FROM stdin;
1	2	1	2	5	Amazing pasta and great ambiance! Will definitely come back.	2026-03-27 12:59:56.780714
2	7	7	7	4	Great Korean BBQ, slightly slow service but food was excellent.	2026-03-27 12:59:56.780714
3	1	1	1	4	Lovely Italian place, good portions and friendly staff.	2026-03-27 12:59:56.780714
\.



COPY public.timeslot (slot_id, restaurant_id, slot_start, slot_end, is_open) FROM stdin;
1	1	2025-04-01 11:00:00	2025-04-01 12:00:00	t
2	1	2025-04-01 12:00:00	2025-04-01 13:00:00	t
3	1	2025-04-01 18:00:00	2025-04-01 19:00:00	f
4	3	2025-04-01 10:00:00	2025-04-01 11:00:00	t
5	3	2025-04-01 11:00:00	2025-04-01 12:00:00	t
6	5	2025-04-01 11:30:00	2025-04-01 12:30:00	t
7	5	2025-04-01 18:00:00	2025-04-01 19:00:00	f
8	6	2025-04-01 09:00:00	2025-04-01 10:00:00	t
9	6	2025-04-01 12:00:00	2025-04-01 13:00:00	t
10	7	2025-04-01 12:00:00	2025-04-01 13:00:00	t
11	7	2025-04-01 19:00:00	2025-04-01 20:00:00	t
12	7	2025-04-01 20:00:00	2025-04-01 21:00:00	t
\.



SELECT pg_catalog.setval('public.admin_action_action_id_seq', 6, true);



SELECT pg_catalog.setval('public.admin_admin_id_seq', 3, true);



SELECT pg_catalog.setval('public.customer_customer_id_seq', 15, true);



SELECT pg_catalog.setval('public.owner_owner_id_seq', 5, true);



SELECT pg_catalog.setval('public.payment_payment_id_seq', 11, true);



SELECT pg_catalog.setval('public.reservation_reservation_id_seq', 12, true);


SELECT pg_catalog.setval('public.restaurant_restaurant_id_seq', 7, true);


SELECT pg_catalog.setval('public.restaurant_table_table_id_seq', 16, true);


SELECT pg_catalog.setval('public.reviews_review_id_seq', 3, true);


SELECT pg_catalog.setval('public.timeslot_slot_id_seq', 12, true);



ALTER TABLE ONLY public.admin_action
    ADD CONSTRAINT admin_action_pkey PRIMARY KEY (action_id);


ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_email_key UNIQUE (email);



ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);



ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_email_key UNIQUE (email);



ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (customer_id);



ALTER TABLE ONLY public.owner
    ADD CONSTRAINT owner_email_key UNIQUE (email);



ALTER TABLE ONLY public.owner
    ADD CONSTRAINT owner_pkey PRIMARY KEY (owner_id);



ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);



ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (reservation_id);



ALTER TABLE ONLY public.restaurant
    ADD CONSTRAINT restaurant_pkey PRIMARY KEY (restaurant_id);



ALTER TABLE ONLY public.restaurant_table
    ADD CONSTRAINT restaurant_table_pkey PRIMARY KEY (table_id);



ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


ALTER TABLE ONLY public.timeslot
    ADD CONSTRAINT timeslot_pkey PRIMARY KEY (slot_id);



ALTER TABLE ONLY public.admin_action
    ADD CONSTRAINT admin_action_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin(admin_id);



ALTER TABLE ONLY public.admin_action
    ADD CONSTRAINT admin_action_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(restaurant_id);


ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservation(reservation_id);



ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id);



ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(restaurant_id);



ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.timeslot(slot_id);



ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.restaurant_table(table_id);



ALTER TABLE ONLY public.restaurant
    ADD CONSTRAINT restaurant_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.owner(owner_id);



ALTER TABLE ONLY public.restaurant_table
    ADD CONSTRAINT restaurant_table_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(restaurant_id);



ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id);



ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservation(reservation_id);



ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(restaurant_id);




ALTER TABLE ONLY public.timeslot
    ADD CONSTRAINT timeslot_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(restaurant_id);




\unrestrict oa6Seg6Y6Pa3yWZklCMEib1RJxC16vUaMCyAbcw8YwVEwOA1j9MKbQwI2NFa7j6

