Digital Repair Hub
===================

Monorepo with a Next.js frontend and a Spring Boot (Java) backend connected to MySQL.

Project Structure
-----------------

- `app/` – Next.js 15 app router frontend (React, TypeScript, Tailwind)
- `backend/` – Spring Boot 3 application (Java 17, JPA/Hibernate, Flyway, MySQL)
- `components/`, `hooks/`, `lib/` – Frontend UI and utilities
- `public/` – Static assets

Prerequisites
-------------

- Node.js 18+ and npm
- Java 17 (JDK) and Maven 3.9+
- MySQL 8+ running locally

Environment Variables
---------------------

Frontend (`.env.local` in repo root):

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Backend (`backend/src/main/resources/application.properties` already configured):

- Defaults to `jdbc:mysql://localhost:3306/repair_hub_db`
- To override via environment variables (optional):
  - `DB_URL`
  - `DB_USERNAME`
  - `DB_PASSWORD`

Database & Migrations
---------------------

- Flyway runs automatically on backend start against `classpath:db/migration` (e.g., `V1__init.sql`).
- The schema will be created/updated if missing. Seed `data.sql` has been removed; the app uses live data only.

Install & Run
-------------

1) Backend (Spring Boot)

```
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

2) Frontend (Next.js)

```
npm install --legacy-peer-deps
npm run dev
```

The frontend starts on `http://localhost:3000`.

Key API Endpoints (for Postman)
-------------------------------

Auth

- `POST /api/auth/register` – `{ email, username, password }`
- `POST /api/auth/login` – `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` – requires `Authorization: Bearer <token>`

Users

- `GET /api/users`

Repair Posts

- `GET /api/repair-posts`
- `GET /api/repair-posts/{id}`
- `POST /api/repair-posts` – `{ item_name, issue_description, repair_steps, success, user_id }`
- `PUT /api/repair-posts/{id}` – partial updates allowed
- `DELETE /api/repair-posts/{id}`

Comments

- `GET /api/repair-posts/{repairPostId}/comments`
- `POST /api/repair-posts/{repairPostId}/comments` – `{ content, user_id, parent_id? }`
- `PUT /api/repair-posts/{repairPostId}/comments/{commentId}` – `{ content }`
- `DELETE /api/repair-posts/{repairPostId}/comments/{commentId}`

Guides

- `GET /api/guides`
- `GET /api/guides/{id}`
- `POST /api/guides` – `{ item_name, guide_content, user_id }`
- `PUT /api/guides/{id}` – partial updates allowed
- `DELETE /api/guides/{id}`

Frontend Integration Notes
--------------------------

- The frontend uses Axios with a base URL from `NEXT_PUBLIC_API_URL` and an auth token stored in `localStorage`.
- Mock data has been removed in favor of the live API; pages use `useApi()` from `lib/api-context.tsx`.

Troubleshooting
---------------

- Port 8080 in use: stop other apps or change `server.port` in `application.properties`.
- MySQL connection issues: verify credentials and that MySQL is running; update `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` env vars if needed.
- CORS errors: `backend/src/main/java/com/repairhub/config/WebConfig.java` enables permissive CORS for local dev.
- Hydration mismatch: the navbar defers user state until client mount to ensure consistent SSR/CSR HTML.

License
-------

MIT


