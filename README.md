# TypoPulse — Backend

Backend for **TypoPulse**, a typing speed game. Handles authentication, game result submission/scoring, and a global leaderboard through a GraphQL API.

## Tech Stack

| Layer | Tech |
| --- | --- |
| Runtime | Bun, Node.js (Vercel serverless runtime) |
| API | GraphQL mounted on Express |
| ORM / DB | Prisma + PostgreSQL |
| Auth | better-auth (email/password + OAuth) |
| Validation | Zod |
| Testing | `bun:test` |
| Deployment | Vercel (serverless function) |
| Containerization | Docker Compose (local/self-hosted alternative) |

## Features

- **Authentication**
  - Email/password registration and login
  - Cookie-based sessions (managed by better-auth)
  - Logout / session invalidation
  - Authenticated `me` query for current user
- **Typing Game**
  - Submit a completed game result (correct characters, wrong attempts, raw time, WPM timeline, per-character timing)
  - Automatic scoring: penalty time for mistakes, total time, and accuracy are calculated **server-side** — the client only sends raw counts and timings, never a final score, so results can't be spoofed
  - Personal game history
  - Personal best score
  - Global leaderboard (ranked by best total time)
- **API Design**
  - Single GraphQL endpoint (`/graphql`) with typed schema, queries, and mutations
  - Centralized Zod-based input validation
  - Consistent error handling: internal error details are never leaked to the client; every error returns a stable `code` in `extensions` (`UNAUTHENTICATED`, `BAD_USER_INPUT`, `NOT_FOUND`, `INTERNAL_ERROR`)

---

# Game Logic & Scoring (authoritative, server-side)

The client sends only what actually happened during play — the server is the single source of truth for the final score.

**Client → server, per `submitGameResult` mutation:**

```graphql
input SubmitGameResultInput {
  correctChars: Int!
  wrongAttempts: Int!
  rawTimeMs: Int!
  wpmTimeline: [Float!]!
  characterTimeline: [Int!]!
}
```

**Server computes:**

| Field | Formula |
| --- | --- |
| `penaltyMs` | `wrongAttempts * 500` — half a second per mistake |
| `totalTimeMs` | `rawTimeMs + penaltyMs` — this is the score used everywhere (personal best, history sorting, leaderboard) |
| `accuracy` | `correctChars / (correctChars + wrongAttempts) * 100` |

A round always ends with `correctChars === 20` (the player must eventually type every character correctly to finish) — `wrongAttempts` represents *extra* incorrect keystrokes made along the way, not skipped characters.

### Leaderboard query

The leaderboard is built with a raw SQL query (`prisma.$queryRaw`) rather than the query builder, since it needs a `GROUP BY` + `MIN()` + `ROW_NUMBER()` window function:

```sql
SELECT
  u.name as "playerName",
  MIN(g."totalTimeMs")::int as "bestTimeMs",
  (ROW_NUMBER() OVER (ORDER BY MIN(g."totalTimeMs") ASC))::int as rank
FROM "GameResult" g
JOIN "user" u ON g."userId" = u.id
GROUP BY u.id, u.name
ORDER BY "bestTimeMs" ASC
LIMIT $1
```

**Important:** `ROW_NUMBER()` (and aggregate functions like `MIN()` on `Int` columns in some drivers) return **`bigint`** in PostgreSQL, which Prisma maps to JavaScript `BigInt` — a type `JSON.stringify` cannot serialize. Both `rank` and `bestTimeMs` are explicitly cast with `::int` in SQL **and** re-coerced with `Number(...)` in JS as a safety net, so a future query change can't silently reintroduce a `BigInt` that crashes the API response.

---

# Authentication

Authentication is handled by **better-auth**, mounted directly on the Express app at `/api/auth/*`, alongside the GraphQL API at `/graphql`.

### Supported methods

- **Email & password** — via GraphQL `register` / `login` mutations, which call `auth.api.signUpEmail` / `auth.api.signInEmail` internally.

### Express ↔ Fetch API bridge

better-auth's handler speaks the **Fetch API** (`Request` in, `Response` out), while Express passes its own `req`/`res` objects. `app.ts` bridges the two explicitly on the `/api/auth/*splat` route:

- `toFetchRequest(req)` — rebuilds a standard `Request` from the Express request's URL, headers, and raw body.
- `sendFetchResponse(res, fetchRes)` — copies the Fetch `Response`'s status, headers, and body back onto `res`, **including every `Set-Cookie` header** via `headers.getSetCookie()`. Naively `return`-ing the Fetch `Response` from an Express handler (or copying headers without handling `Set-Cookie` specially) silently drops the session cookie — login appears to succeed but no session is actually persisted in the browser.

### Sessions

- Sessions are stored server-side (via the `Session` Prisma model) and identified by an **HTTP-only cookie** set on successful login/OAuth.
- Every GraphQL request reads the session from the incoming cookie (`auth.api.getSession`) in `context.ts`, exposing `userId` / `user` to all resolvers.
- Protected resolvers (`me`, `logout`, `submitGameResult`, `myGameHistory`, `myBestScore`) check `context.userId` and return an `UNAUTHENTICATED` GraphQL error if there is no active session.
- Cookie attributes are set for cross-site use (`sameSite: "none"`, `secure: true` in `lib/auth.ts`), since the frontend and backend are deployed on different domains — see **Deployment** below for how the cookie actually reaches the browser in that setup.

### CORS & cookies

Because sessions rely on cookies, the frontend and backend must be treated as cross-origin, and CORS must be configured with an **exact origin** (not `*`) plus `credentials: true`:

```js
app.use(
  cors({
    origin: process.env.APP_URL, // e.g. http://localhost:3000
    credentials: true,
  })
);
```

`better-auth`'s `trustedOrigins` must also include the frontend origin, or session cookies will be rejected.

---

# Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
| --- | --- |
| `PORT` | Port the backend listens on locally (e.g. `4000`) |
| `APP_URL` | Frontend origin, used for CORS (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_URL` | Public URL of this backend, used by better-auth |
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key used by better-auth to sign/encrypt sessions |

---

# Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Run database migrations

```bash
bunx prisma migrate dev
```

### 3. Start the dev server

```bash
bun run dev
```

The GraphQL API is now available at `http://localhost:<PORT>/graphql` (GraphiQL playground included in development).

### 4. Run with Docker Compose (Alternative)

This spins up the backend (and its database, if defined in `docker-compose.yml`) in containers.

```bash
docker-compose up --build
```

To run in the background:

```bash
docker-compose up --build -d
```

Stop the containers:

```bash
docker-compose down
```

**Note:** `prisma generate` runs at build time and requires a `DATABASE_URL` to be resolvable in the build stage — this is set via a placeholder `ENV` in the `Dockerfile`. The real `DATABASE_URL` used at runtime comes from the `environment:` section of `docker-compose.yml` (or an `.env` file loaded by Compose), which overrides the build-time placeholder.

---

# Testing

Tests use Bun's built-in test runner (`bun:test`) with mocked Prisma and mocked `better-auth` calls — no real database is required to run the test suite. Mock files (`lib/__mocks__/prisma.ts`) are excluded from the production build config, since `bun:test` isn't resolvable outside Bun.

```bash
bun test
```

Covers:

- `auth.service.test.ts` — registration, login, logout, current-user lookup, and duplicate-email/invalid-credentials handling
- `game.service.test.ts` — history, best score, leaderboard, and result submission (including score/penalty/accuracy calculation)
- `leaderboard.test.ts` — leaderboard ranking and limits

---

# Error Handling Convention

- Input validation errors → `BAD_USER_INPUT`
- Missing/invalid session → `UNAUTHENTICATED`
- Resource not found → `NOT_FOUND`
- Anything unexpected → `INTERNAL_ERROR` (details are logged server-side via `console.error`, never returned to the client)

---

# Example GraphQL Operations

```graphql
mutation Register {
  register(input: { name: "Jane", email: "jane@mail.com", password: "secret123" }) {
    user { id name email }
  }
}

mutation Login {
  login(input: { email: "jane@mail.com", password: "secret123" }) {
    user { id name email }
  }
}

mutation SubmitGameResult {
  submitGameResult(input: {
    correctChars: 18
    wrongAttempts: 2
    rawTimeMs: 45000
    wpmTimeline: [30, 35, 40]
    characterTimeline: [500, 520, 480]
  }) {
    totalTimeMs
    accuracy
  }
}

query Leaderboard {
  leaderboard(limit: 10) {
    rank
    playerName
    bestTimeMs
  }
}
```
