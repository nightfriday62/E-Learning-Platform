# E-Learning Platform

## 1. Introduction

E-Learning is a learning application with courses, study materials, quizzes, and
progress tracking. It includes student and instructor functionality and an
administration API. The frontend is built with React, TypeScript, Vite, and
Tailwind CSS; the backend uses Express, MongoDB, and Mongoose.

## 2. How to start

### Prerequisites

- Node.js 20 or later and npm
- A running MongoDB instance, either local or hosted

### Configure the backend

Create `Backend/.env` if it does not already exist:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGO_DB=yourdbname
JWT_SECRET=replace-with-a-long-random-secret
```

Replace `MONGODB_URI` if using a hosted database, set `MONGO_DB` to the desired
database name, and use your own secret for `JWT_SECRET`, which is needed for
authentication. `MONGO_DB` is required and overrides any database name in the
URI. For MongoDB authentication, specify `authSource` in the URI if the
credentials belong to a different database. Keep `.env` private.
The backend must connect to MongoDB before it starts listening.

S3-backed file features also require `AWS_REGION`, `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME` in `Backend/.env`.

### Start the backend

From the repository root:

```bash
cd Backend
npm install
npm run dev
```

The API defaults to `http://localhost:3000`. Check
`http://localhost:3000/health` to verify the server and database connection.
Use `npm start` instead to run without automatic restarts.

### Start the frontend

Open a second terminal and run from the repository root:

```bash
cd Frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. The backend permits that origin
in development. The frontend normally connects to `http://localhost:3000`;
its shared API helper supports `VITE_API_BASE_URL` in `Frontend/.env`, but
some requests use port 3000 directly, so use the default backend port for local
development.

Stop either server with `Ctrl+C`. For information on importing the provided
database exports, see [Backend/db-dump-json/README.md](Backend/db-dump-json/README.md).
The import script can replace data, so check its instructions before running it.

## 3. System structure

```text
Frontend/
  src/
    components/   Reusable UI components
    contexts/     Authentication and course state
    pages/        Application screens
    routes/       Route and access-control components
    types/        TypeScript types
    utils/        API request helper
Backend/
  app.js          Express server and API route registration
  src/
    config/       Database and external service configuration
    routes/       API route definitions
    controllers/  Request handlers
    services/     Application and external-service logic
    models/       MongoDB data models
    middleware/   Authentication and upload middleware
    utils/        Backend utilities
  scripts/        Database import/export scripts
  db-dump-json/   JSON collection exports
```

The React frontend sends HTTP requests to the Express API. The API handles
authentication, courses, progress, instructor operations, study activities,
and administration under `/api/`, and stores application data in MongoDB.
