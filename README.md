# Article API

A clean, beginner-friendly REST API for managing users, articles, and discussion comments. Built with **Hono**, **Node SQLite** (`node:sqlite`), **Drizzle ORM**, and **Scalar OpenAPI Reference**.

## Features

- **Authentication**: Hand-rolled JWT with `hono/jwt` and `bcryptjs` password hashing.
- **Classic Layered Architecture**: Clear separation of `routes` → `controllers` → `services` → `db/schema`.
- **Database**: Embedded SQLite using Node.js built-in `node:sqlite` (`DatabaseSync`) and Drizzle ORM.
- **Pagination**: Simple offset pagination (`page`, `limit`, `total`, `totalPages`).
- **Interactive Documentation**: Interactive Scalar API Reference UI (Saturn theme) at `/api/reference`.
- **Error Handling**: Centralized `ApiError` class with clean JSON error responses.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create `.env` (a template is available in `.env.example`):

```dotenv
PORT=3000
NODE_ENV=development
DB_FILE_NAME=article_api.sqlite
JWT_SECRET=super_secret_jwt_key_12345
```

### 3. Run Migrations

```bash
pnpm db:migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

The server will be running at `http://localhost:3000`.

## Interactive API Documentation

Visit **`http://localhost:3000/api/reference`** in your browser to view the interactive Scalar API documentation and test endpoints directly.

OpenAPI JSON specification is also available at:
`http://localhost:3000/api/doc`

## Project Structure

```text
src/
├── controllers/            # Request handlers
│   ├── article.controller.ts
│   ├── auth.controller.ts
│   ├── comment.controller.ts
│   └── user.controller.ts
├── db/                     # Database setup and schema definitions
│   ├── index.ts            # node:sqlite DatabaseSync and Drizzle client
│   ├── relations.ts        # Drizzle defineRelations
│   └── schema/
│       ├── accounts.ts     # User credentials
│       ├── articles.ts     # Articles
│       ├── comments.ts     # Comments
│       ├── index.ts        # Schema exports
│       ├── profiles.ts     # User profiles
│       └── session.ts      # Sessions
├── middlewares/            # Middlewares
│   ├── auth.middleware.ts  # JWT verification (Bearer token)
│   ├── error.middleware.ts # Global ApiError handler
│   └── not-found.middleware.ts # 404 handler
├── routes/                 # OpenAPI route definitions
│   ├── article.routes.ts
│   ├── auth.routes.ts
│   ├── comment.routes.ts
│   ├── index.ts
│   └── user.routes.ts
├── services/               # Business logic and database operations
│   ├── article.service.ts
│   ├── auth.service.ts
│   ├── comment.service.ts
│   └── user.service.ts
├── utils/                  # Reusable utilities
│   ├── api-error.ts        # Custom ApiError class
│   ├── openapi-helpers.ts  # OpenAPI helpers
│   └── pagination.ts       # Offset pagination helper
├── app.ts                  # Hono application setup and middleware
├── config.ts               # Environment configuration
└── index.ts                # Application entrypoint (@hono/node-server)
```

## Running Verification Smoke Tests

```bash
pnpm test
```
