# Leasing & Registration System

Full-stack app for a leasing and registration workflow. The project combines a Next.js frontend, a NestJS REST API, and PostgreSQL, with JWT-based authentication and Docker-based local deployment.

<img width="1919" height="1079" alt="Screenshot 2026-04-18 214224" src="https://github.com/user-attachments/assets/e849ec8c-9770-4007-b25e-ddcd4ff7a910" />

## Overview

This project was built as a demo system to showcase:

- modern full-stack architecture
- authenticated user flows
- CRUD-style leasing workflows
- database-backed data management
- containerized development and deployment

## Features

- User registration and login
- JWT authentication with protected routes
- Password hashing with bcrypt
- Lease creation and personal lease history
- Lease status workflow: `pending`, `approved`, `rejected`
- Responsive frontend built with Next.js App Router and Tailwind CSS
- Docker Compose setup for the full stack

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: NestJS 11, TypeORM, Passport JWT, class-validator
- Database: PostgreSQL 16
- Tooling: Docker, ESLint, Prettier

## Project Structure

- `frontend/` - Next.js client application
- `backend/` - NestJS API server
- `docker-compose.yml` - local orchestration for frontend, backend, and PostgreSQL

## Getting Started

### Option 1: Run with Docker

This is the easiest way to run the entire stack.

```bash
docker compose up --build -d
```

After startup:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- PostgreSQL: localhost:5433

Useful commands:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

### Option 2: Run Locally

Use this if you want to develop the frontend and backend directly on your machine.

#### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

#### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and fill in the values.

The default local setup expects:

- `DB_HOST=127.0.0.1`
- `DB_PORT=5433`

#### 3. Run the backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on http://localhost:3001.

#### 4. Configure the frontend

Copy `frontend/.env.example` to `frontend/.env.local`.

#### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:3000.

## Environment Variables

### Backend

- `PORT`
- `FRONTEND_ORIGIN`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SYNCHRONIZE`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

### Frontend

- `NEXT_PUBLIC_API_URL`

## API Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`

### Leases

- `POST /leases`
- `GET /leases/me`
- `GET /leases`
- `PATCH /leases/:id/status`

## Example Payloads

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

## Notes

- This is a demo/portfolio project, so the default data and setup are intended for local development and showcase purposes.
- Keep secrets in local `.env` files only. Commit `.env.example` files instead.
