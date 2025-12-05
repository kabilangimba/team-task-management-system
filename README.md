# Team Task Management System

A full-stack task management platform that combines a Django REST API with a modern React frontend to help distributed teams plan, assign, and complete work with clear ownership.

---

## Table of Contents
1. [Product Overview](#product-overview)
2. [Feature Highlights](#feature-highlights)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Repository Structure](#repository-structure)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
7. [Running & Testing](#running--testing)
8. [Role & Permission Matrix](#role--permission-matrix)
9. [API Overview](#api-overview)
10. [Deployment Notes](#deployment-notes)
11. [Troubleshooting](#troubleshooting)
12. [License & Credits](#license--credits)

---

## Product Overview
Team Task Management System delivers:
- Secure authentication powered by JWT.
- Fine-grained role-based access (Admin, Manager, Member).
- Work management features (task CRUD, assignment, status transitions).
- User administration for global administrators.
- A responsive React interface optimized for desktop and tablet usage.

Use it to coordinate cross-functional teams, visualize workload, and keep delivery on track.

---

## Feature Highlights
- **Authentication & Session Management**
  - Sign up/login flows with validation feedback.
  - Token refresh and logout endpoints.
- **Role-Aware Workspaces**
  - Admins manage users and tasks globally.
  - Managers create tasks and assign them to team members (but never to themselves).
  - Members update progress on their assigned tasks.
- **Task Lifecycle**
  - Create, edit, filter, and delete tasks with assignee/deadline metadata.
  - Visual status badges (`todo`, `in_progress`, `done`) and permission-aware actions.
- **User Experience**
  - Modern onboarding UI with branded headers.
  - Protected routes using React Router.
  - Context-based auth hook for global state.
- **Developer Productivity**
  - Centralized `taskService`/`userService` modules.
  - Strict linting (ESLint flat config) and sensible backend project layout.

---

## Architecture
```
┌─────────────┐        HTTPS        ┌──────────────────────────┐
│ React (Vite)│ <─────────────────> │ Django REST API + JWT    │
│ SPA Frontend│                    │ (users, tasks apps)       │
└─────────────┘                    └──────────────────────────┘
        │                                   │
        │ Axios                              │ ORM
        ▼                                   ▼
  Local Storage                      PostgreSQL Database
  (access/refresh tokens)            (users, tasks tables)
```

- **Frontend** handles routing, state, and API orchestration.
- **Backend** enforces business rules, role checks, and data persistence.
- **PostgreSQL** stores user accounts, tasks, and metadata.

---

## Technology Stack
| Layer      | Tools & Libraries                                                                 |
|------------|------------------------------------------------------------------------------------|
| Frontend   | React 18, React Router, Vite, Axios, ESLint (flat config), modern CSS styling      |
| Backend    | Django 5, Django REST Framework, SimpleJWT, python-decouple, PostgreSQL driver     |
| Auth       | JSON Web Tokens (access + refresh, blacklist on logout)                           |
| DevOps     | Gunicorn, Nginx, DigitalOcean (reference), `.env` configuration per environment   |

---

## Repository Structure
```
task-management/
├── backend/
│   ├── config/          # Django project settings, URLs, WSGI/ASGI
│   ├── tasks/           # Task models, serializers, viewsets, URLs
│   └── users/           # Custom user model, auth endpoints, permissions
└── frontend/
    ├── src/
    │   ├── pages/       # Login, Register, Dashboard, Tasks, etc.
    │   ├── components/  # Navbar, ProtectedRoute, forms
    │   └── services/    # API clients (taskService, userService)
    └── public/          # Static assets (Vite)
```

---

## Getting Started

### Prerequisites
- **System**: macOS / Linux / WSL2 (preferred)  
- **Python**: 3.10 or newer  
- **Node.js**: 18 LTS or newer  
- **PostgreSQL**: 14+ (local or remote instance)  
- **Package Managers**: `pip`, `npm`

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local dev, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames/IPs |
| `DATABASE_NAME` | PostgreSQL database name |
| `DATABASE_USER` | PostgreSQL user |
| `DATABASE_PASSWORD` | PostgreSQL password |
| `DATABASE_HOST` | Database host (e.g. `localhost` or internal VIP) |
| `DATABASE_PORT` | Database port (default `5432`) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated origins (e.g. `http://localhost:5173`) |

> Copy `backend/.env.example` if available or create the file manually following the table above.

#### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:8000/api`) |

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # if provided
vim .env              # fill in the variables listed above

# Database migrations & superuser
python manage.py migrate
python manage.py createsuperuser

# Start API server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup
```bash
cd frontend
npm install

# Run Vite dev server (defaults to http://localhost:5173)
npm run dev
```

Visit the frontend URL in your browser; it will proxy API requests to the backend via `VITE_API_URL`.

---

## Running & Testing

### Backend
```bash
cd backend
source venv/bin/activate
python manage.py test              # Run Django test suite
python manage.py check             # System checks
```

### Frontend
```bash
cd frontend
npm run dev                        # Start development server
npm run build                      # Production build
npm run lint                       # ESLint (flat config)
```

---

## Role & Permission Matrix

| Capability                              | Admin | Manager                           | Member                               |
|-----------------------------------------|:-----:|:---------------------------------:|:------------------------------------:|
| View dashboard & own tasks              |  ✅   |  ✅                               |  ✅                                   |
| Create tasks                            |  ✅   |  ✅ (auto-set as creator)         |  ❌                                   |
| Assign tasks                            |  ✅   |  ✅ (to team members only)        |  ❌                                   |
| Update any task                         |  ✅   |  ✅ (only tasks they created)     |  ❌ (status-only on assigned tasks)  |
| Update task status                      |  ✅   |  ✅                               |  ✅ (if assigned)                     |
| Delete tasks                            |  ✅   |  ✅ (only tasks they created)     |  ❌                                   |
| Manage users (CRUD)                     |  ✅   |  ❌                               |  ❌                                   |
| Access admin site (`/admin`)            |  ✅   |  ❌                               |  ❌                                   |

---

## API Overview
Base URL: `http://<backend-host>/api/`

| Endpoint | Method(s) | Description |
|----------|-----------|-------------|
| `auth/register/` | `POST` | Create user + issue JWT tokens |
| `auth/login/` | `POST` | Obtain tokens via email/password |
| `auth/logout/` | `POST` | Blacklist refresh token |
| `auth/token/refresh/` | `POST` | Refresh access token |
| `users/` | `GET/POST/PUT/PATCH/DELETE` | Admin + manager views via `UserViewSet` |
| `users/me/` | `GET` | Current authenticated user |
| `users/change_password/` | `PUT` | Authenticated password change |
| `tasks/` | `GET/POST` | List/create tasks (permissions enforced server-side) |
| `tasks/{id}/` | `GET/PUT/PATCH/DELETE` | Retrieve/update/delete specific task |
| `tasks/stats/` | `GET` | Aggregated stats per role |

Pagination/search can be layered via DRF if needed. Extend serializers/viewsets for additional business logic.

---

## Deployment Notes
1. **Backend**
   - Use Gunicorn behind Nginx.
   - Configure `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and secure `SECRET_KEY`.
   - Run `python manage.py collectstatic` if serving static assets.
2. **Frontend**
   - Build with `npm run build` and serve `dist/` via Nginx or a CDN.
   - Ensure `VITE_API_URL` points to the public API domain before building.
3. **Database**
   - Apply migrations and create admin accounts prior to going live.
   - Configure automated backups.

For a full production guide see `DEPLOYMENT.md` (add this file if not present).

---

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `ModuleNotFoundError: No module named 'django'` | Virtualenv not activated | `source venv/bin/activate` before running commands |
| 401 errors on API calls | Missing/expired access token | Confirm login flow, inspect local storage tokens |
| CORS errors in browser console | `CORS_ALLOWED_ORIGINS` missing frontend URL | Update backend `.env` and restart server |
| Manager cannot see team members in dropdown | Backend `users/` endpoint restricted | Ensure you’re running latest code where managers can list members |

---

## License & Credits
- **License:** MIT
- **Author:** kabila ngimba


## credentials for demo

for member
username:member@demo.com
password:Member@123

for manager
username:manager@demo.com
password:Manager@123
