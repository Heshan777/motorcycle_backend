# Motorcycle Company Backend (MERN)

Complete backend API for a motorcycle company website using Node.js, Express, MongoDB, and JWT auth.

## Features

- Authentication (register, login, profile, password change)
- Role-based access control (`user`, `admin`)
- Motorcycle catalog CRUD with filters, sorting, and pagination
- Customer inquiry management
- Test ride booking management
- Admin dashboard statistics endpoint

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Production start:

```bash
npm start
```

## API Base URL

`/api/v1`

## Endpoints

### Health

- `GET /health`

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/google` (start OAuth redirect flow)
- `GET /auth/google/callback` (OAuth callback)
- `POST /auth/google` (Google credential token login)
- `GET /auth/me` (protected)
- `PUT /auth/me` (protected)
- `PUT /auth/change-password` (protected)
- `GET /auth/users` (admin)
- `PUT /auth/users/:id/role` (admin)
- `DELETE /auth/users/:id` (admin)

### Motorcycles

- `GET /motorcycles`
- `GET /motorcycles/:identifier` (slug or Mongo id)
- `POST /motorcycles` (admin)
- `PUT /motorcycles/:id` (admin)
- `DELETE /motorcycles/:id` (admin)

### Inquiries

- `POST /inquiries` (public)
- `GET /inquiries` (admin)
- `PUT /inquiries/:id/status` (admin)
- `DELETE /inquiries/:id` (admin)

### Bookings

- `POST /bookings` (public)
- `GET /bookings` (protected: own bookings, admin sees all)
- `PUT /bookings/:id/status` (admin)
- `DELETE /bookings/:id` (protected)

### Dashboard

- `GET /dashboard/stats` (admin)

## Sample motorcycle query params

- `search`
- `brand`
- `category`
- `minPrice`
- `maxPrice`
- `status`
- `featured=true|false`
- `sort=newest|oldest|priceAsc|priceDesc|nameAsc|nameDesc`
- `page`, `limit`
