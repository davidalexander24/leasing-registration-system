# Leasing & Registration System

Fullstack leasing application with:
- Next.js (App Router) frontend
- NestJS backend (REST APIs)
- PostgreSQL database
- JWT-based authentication flow

## Features

- User registration and login
- Password hashing with bcrypt
- JWT access token issuance
- Protected lease endpoints with NestJS guards
- Lease creation and user-specific lease history
- Basic lease status workflow (`pending`, `approved`, `rejected`)

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: NestJS 11, TypeORM, PostgreSQL, Passport JWT, class-validator
- Database: PostgreSQL 16 (via Docker Compose)

## Project Structure

- `frontend/`: Next.js client app
- `backend/`: NestJS API server
- `docker-compose.yml`: full stack orchestration (frontend, backend, PostgreSQL)

## Managed Docker Deployment

Run everything in containers:

```bash
docker compose up --build -d
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5433 (container port 5432)

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

Notes:

- Backend in Docker uses internal database host `postgres:5432`.
- Local host mapping remains `5433:5432` to avoid conflicts with local PostgreSQL on 5432.
- Make sure ports `3000` and `3001` are free before running full stack Docker, otherwise container startup will fail with `EADDRINUSE`.

## Quick Start

This section is for running apps directly with Node.js on your machine (without Docker for app runtime).

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Configure backend env

Create `backend/.env` from `backend/.env.example`.

The default setup uses `DB_HOST=127.0.0.1` and `DB_PORT=5433` to avoid conflicts with any local PostgreSQL already running on port 5432.

### 3. Run backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on `http://localhost:3001` by default.

### 4. Configure frontend env

Create `frontend/.env.local` from `frontend/.env.example`.

### 5. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Main API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Leases (JWT required)

- `POST /leases`
- `GET /leases/me`
- `GET /leases`
- `PATCH /leases/:id/status`

## Sample Request Bodies

### Register

```json
{
  "fullName": "David Alexander",
  "email": "david@example.com",
  "password": "secret123"
}
```

### Login

```json
{
  "email": "david@example.com",
  "password": "secret123"
}
```

### Create Lease

```json
{
  "assetName": "Toyota Avanza 2026",
  "leaseAmount": 420.75,
  "termMonths": 24,
  "startDate": "2026-05-01"
}
```
