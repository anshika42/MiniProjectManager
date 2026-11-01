# Mini Project Manager

A small project and task manager with a Next.js frontend and a Node.js/Express API. MongoDB stores users, projects, and tasks; JWT protects project and task endpoints.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string

## Setup

1. Install dependencies from the project root:

   ```bash
   npm install
   ```

2. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
3. Copy `frontend/.env.example` to `frontend/.env.local` if the API is not at `http://localhost:4000/api`.
4. Start both apps from the project root:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). The API health check is at [http://localhost:4000/api/health](http://localhost:4000/api/health).

## Features

- Sign up and sign in with email and password.
- Each account can create and delete its own projects.
- Projects contain tasks with a title, description, status, and optional due date.
- Update task status, delete tasks, filter by status, and sort by due date or creation date.
- JWT authentication is required for all project and task API routes.

## API

- `POST /api/auth/register` and `POST /api/auth/login`
- `GET /api/projects`, `POST /api/projects`
- `GET /api/projects/:projectId`, `PATCH /api/projects/:projectId`, `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/projects/:projectId/tasks/:taskId` and `DELETE /api/projects/:projectId/tasks/:taskId`

Send `Authorization: Bearer <token>` with project and task requests.

## Notes

- Tasks are stored inside their project document to keep the data model simple.
- The frontend uses Redux Toolkit for the signed-in user and token. Project and task data is fetched directly from the REST API.
- The JWT secret must be kept private and changed from the example before deployment.
