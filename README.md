# TypoPulse — Backend

Backend for **TypoPulse**, a typing speed game. Handles authentication, game
result submission/scoring, and a global leaderboard through a GraphQL API.

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | [Bun](https://bun.sh) (dev), Node.js (Vercel serverless runtime) |
| API | GraphQL ([graphql-yoga](https://the-guild.dev/graphql/yoga-server)) mounted on Express |
| ORM / DB | [Prisma](https://www.prisma.io/) + PostgreSQL |
| Auth | [better-auth](https://www.better-auth.com/) (email/password + OAuth) |
| Validation | [Zod](https://zod.dev/) |
| Testing | `bun:test` |
| Deployment | Vercel (serverless function) |
| Containerization | Docker Compose (local/self-hosted alternative) |

## Features

- **Authentication**
  - Email/password registration and login
  - Google & GitHub OAuth (social login)
  - Cookie-based sessions (managed by better-auth)
  - Logout / session invalidation
  - Authenticated `me` query for current user

- **Typing Game**
  - Submit a completed game result (correct characters, wrong attempts,
    raw time, WPM timeline, per-character timing)
  - Automatic scoring: penalty time for mistakes, total time, and accuracy
    are calculated **server-side** — the client only sends raw counts and
    timings, never a final score, so results can't be spoofed
  - Personal game history
  - Personal best score
  - Global leaderboard (ranked by best total time)

- **API Design**
  - Single GraphQL endpoint (`/graphql`) with typed schema, queries, and
    mutations
  - Centralized Zod-based input validation
  - Consistent error handling: internal error details are never leaked to
    the client; every error returns a stable `code` in `extensions`
    (`UNAUTHENTICATED`, `BAD_USER_INPUT`, `NOT_FOUND`, `INTERNAL_ERROR`)

---

## Project Structure

```
backend/
├── src/
│   ├── graphql/
│   │   └── schema.ts            # Combines base + feature typeDefs/resolvers, builds the schema
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.typeDefs.ts
│   │   │   ├── auth.resolver.ts
│   │   │   └── auth.service.ts
│   │   └── game/
│   │       ├── game.typeDefs.ts
│   │       ├── game.resolver.ts
│   │       └── game.service.ts   # includes raw-SQL leaderboard query
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client (pg adapter)
│   │   ├── auth.ts               # better-auth config (cookies, providers)
│   │   └── __mocks__/prisma.ts   # bun:test mock, excluded from prod build
│   ├── validation/
│   │   └── schemas.ts            # Zod schemas + validateOrThrow helper
│   ├── context.ts                # GraphQL context (session, headers, res)
│   ├── app.ts                    # Express app: CORS, auth bridge, /graphql mount
│   └── server.ts                 # Local dev entry point (app.listen); exports app for serverless use
├── generated/
│   └── prisma/                   # Custom Prisma Client output (non-default path)
├── prisma/
│   └── schema.prisma
├── api/
│   └── server.js                 # Bundled, pre-compiled entry point deployed to Vercel
├── tests/
├── .env.example
├── docker-compose.yml
├── vercel.json
└── README.md
```

---

## Game Logic & Scoring (authoritative, server-side)

The client sends only what actually happened during play — the server is
the single source of truth for the final score.

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
|---|---|
| `penaltyMs` | `wrongAttempts * 500` — half a second per mistake |
| `totalTimeMs` | `rawTimeMs + penaltyMs` — this is the score used everywhere (personal best, history sorting, leaderboard) |
| `accuracy` | `correctChars / (correctChars + wrongAttempts) * 100` |

A round always ends with `correctChars === 20` (the player must eventually
type every character correctly to finish) — `wrongAttempts` represents
*extra* incorrect keystrokes made along the way, not skipped characters.

### Leaderboard query

The leaderboard is built with a raw SQL query (`prisma.$queryRaw`) rather
than the query builder, since it needs a `GROUP BY` + `MIN()` +
`ROW_NUMBER()` window function:

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

**Important:** `ROW_NUMBER()` (and aggregate functions like `MIN()` on
`Int` columns in some drivers) return **`bigint`** in PostgreSQL, which
Prisma maps to JavaScript `BigInt` — a type `JSON.stringify` cannot
serialize. Both `rank` and `bestTimeMs` are explicitly cast with `::int`
in SQL **and** re-coerced with `Number(...)` in JS as a safety net, so a
future query change can't silently reintroduce a `BigInt` that crashes
the API response.

---

## Authentication

Authentication is handled by **better-auth**, mounted directly on the
Express app at `/api/auth/*`, alongside the GraphQL API at `/graphql`.

### Supported methods

- **Email & password** — via GraphQL `register` / `login` mutations, which
  call `auth.api.signUpEmail` / `auth.api.signInEmail` internally.
- **OAuth (Google, GitHub)** — the frontend redirects the browser directly
  to the backend's REST auth endpoints (not through GraphQL), since OAuth
  requires full-page redirects:
  ```
  GET /api/auth/google
  GET /api/auth/github
  ```

### Express ↔ Fetch API bridge

better-auth's handler speaks the **Fetch API** (`Request` in, `Response`
out), while Express passes its own `req`/`res` objects. `app.ts` bridges
the two explicitly on the `/api/auth/*splat` route:

- `toFetchRequest(req)` — rebuilds a standard `Request` from the Express
  request's URL, headers, and raw body.
- `sendFetchResponse(res, fetchRes)` — copies the Fetch `Response`'s
  status, headers, and body back onto `res`, **including every
  `Set-Cookie` header** via `headers.getSetCookie()`. Naively `return`-ing
  the Fetch `Response` from an Express handler (or copying headers without
  handling `Set-Cookie` specially) silently drops the session cookie —
  login appears to succeed but no session is actually persisted in the
  browser.

### Sessions

- Sessions are stored server-side (via the `Session` Prisma model) and
  identified by an **HTTP-only cookie** set on successful login/OAuth.
- Every GraphQL request reads the session from the incoming cookie
  (`auth.api.getSession`) in `context.ts`, exposing `userId` / `user` to
  all resolvers.
- Protected resolvers (`me`, `logout`, `submitGameResult`, `myGameHistory`,
  `myBestScore`) check `context.userId` and return an `UNAUTHENTICATED`
  GraphQL error if there is no active session.
- Cookie attributes are set for cross-site use (`sameSite: "none"`,
  `secure: true` in `lib/auth.ts`), since the frontend and backend are
  deployed on different domains — see **Deployment** below for how the
  cookie actually reaches the browser in that setup.

### CORS & cookies

Because sessions rely on cookies, the frontend and backend must be treated
as cross-origin, and CORS must be configured with an **exact origin** (not
`*`) plus `credentials: true`:

```ts
app.use(
  cors({
    origin: process.env.APP_URL, // e.g. http://localhost:3000
    credentials: true,
  })
);
```

`better-auth`'s `trustedOrigins` must also include the frontend origin, or
session cookies will be rejected.

---

## Deployment (Vercel)

The backend deploys as a Vercel serverless function. A few
Vercel/Express/ESM-specific issues came up that are worth documenting so
they don't resurface:

- **No `app.listen()` in production.** Vercel invokes the exported
  Express app per-request; it doesn't run a long-lived server process.
  `server.ts` guards the local dev listener behind
  `NODE_ENV !== "production"` and always `export default app` for
  Vercel to use.
- **Express 5 wildcard routes must be named.** `path-to-regexp` v6+
  (used internally by Express 5) throws `Missing parameter name` at
  route-registration time — i.e. the server crashes on cold start,
  before handling a single request — if a route uses a bare `"*"`.
  Use a named wildcard instead: `app.options("/*splat", cors())`.
- **Bundle before deploying.** Deploying raw multi-file TypeScript
  source (with `.js`-suffixed ESM imports pointing at `.ts` files) can
  fail Vercel's dependency tracing at runtime (`Cannot find module`).
  `api/server.js` is a single pre-bundled, pre-compiled file (all local
  imports inlined) so Vercel has nothing to resolve at runtime.
- **Cross-origin cookies.** The frontend and backend live on different
  Vercel domains, so a cookie set directly by the backend is not visible
  to the frontend's own origin. This is solved on the **frontend** side
  via Next.js rewrites that proxy `/api/auth/*` and `/graphql` through
  the frontend's own origin — see the frontend README's
  "Notes on Cross-Origin Auth" section for the full explanation.

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `PORT` | Port the backend listens on locally (e.g. `4000`) |
| `APP_URL` | Frontend origin, used for CORS (e.g. `http://localhost:3000`) |
| `BETTER_AUTH_URL` | Public URL of this backend, used by better-auth |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth credentials |

---

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
# fill in DATABASE_URL, APP_URL, PORT, OAuth credentials
```

### 3. Run database migrations

```bash
bunx prisma migrate dev
```

### 4. Start the dev server

```bash
bun run dev
```

The GraphQL API is now available at `http://localhost:<PORT>/graphql`
(GraphiQL playground included in development).

### 5. Run with Docker Compose (optional)

This spins up the backend (and its database, if defined in
`docker-compose.yml`) in containers.

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

**Note:** `prisma generate` runs at build time and requires a `DATABASE_URL`
to be resolvable in the build stage — this is set via a placeholder `ENV`
in the `Dockerfile`. The real `DATABASE_URL` used at runtime comes from the
`environment:` section of `docker-compose.yml` (or an `.env` file loaded by
Compose), which overrides the build-time placeholder.

---

## Testing

Tests use Bun's built-in test runner (`bun:test`) with mocked Prisma and
mocked `better-auth` calls — no real database is required to run the test
suite. Mock files (`lib/__mocks__/prisma.ts`) are excluded from the
production build config, since `bun:test` isn't resolvable outside Bun.

```bash
bun test
```

Covers:
- `auth.service.test.ts` — registration, login, logout, current-user
  lookup, and duplicate-email/invalid-credentials handling
- `game.service.test.ts` — history, best score, leaderboard, and result
  submission (including score/penalty/accuracy calculation)
- `leaderboard.test.ts` — leaderboard ranking and limits

---

## Error Handling Convention

- Input validation errors → `BAD_USER_INPUT`
- Missing/invalid session → `UNAUTHENTICATED`
- Resource not found → `NOT_FOUND`
- Anything unexpected → `INTERNAL_ERROR` (details are logged server-side
  via `console.error`, never returned to the client)

---

## Example GraphQL Operations

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
