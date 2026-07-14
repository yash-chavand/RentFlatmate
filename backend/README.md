# Auth Module — Rent & Flatmate Finder

Implements the full authentication slice of the blueprint: register, login,
silent refresh (rotating), logout, and `GET /me`, wired through the
Controller → Service → Repository → Prisma layering.

## What's included

```
src/
├── config/
│   ├── env.js              # Zod-validated env, fails fast on boot
│   └── db.js                # Prisma client singleton
├── prisma/
│   └── schema.prisma        # User + RefreshToken (rest of the schema plugs in later)
├── repositories/
│   ├── user.repository.js
│   └── refreshToken.repository.js
├── services/
│   └── auth.service.js      # register/login/refresh/logout business rules
├── controllers/
│   └── auth.controller.js   # HTTP layer, sets/clears the refresh cookie
├── validators/
│   └── auth.validator.js    # Zod schemas
├── middlewares/
│   ├── validate.middleware.js
│   ├── auth.middleware.js   # verifies access token -> req.user
│   ├── role.middleware.js   # authorize('OWNER', 'ADMIN', ...)
│   ├── error.middleware.js
│   ├── notFound.middleware.js
│   └── rateLimiter.middleware.js
├── routes/
│   ├── auth.routes.js
│   └── index.js
├── utils/
│   ├── asyncHandler.js
│   ├── ApiError.js
│   ├── ApiResponse.js
│   ├── logger.js
│   ├── jwt.util.js
│   └── hash.util.js
├── app.js
└── server.js
```

## How the pieces fit together

- **Access token**: short-lived JWT (`JWT_ACCESS_EXPIRY`, default 15m),
  returned in the JSON response body, sent by the client as
  `Authorization: Bearer <token>`. Verified per-request by
  `auth.middleware.js`, which does **not** hit the database — it trusts the
  signature and expiry only, for speed.
- **Refresh token**: longer-lived JWT (`JWT_REFRESH_EXPIRY`, default 7d), set
  as an `httpOnly`, `secure` (in production), `sameSite=strict` cookie scoped
  to `/api/v1/auth`. Its **hash** (not the raw token) is persisted in the
  `RefreshToken` table, which is what makes server-side revocation possible —
  a bare JWT can't be "un-issued," but a DB row can be marked `revokedAt`.
- **Rotation**: every call to `/auth/refresh` issues a brand-new pair and
  revokes the old refresh token (`replacedBy` links old → new for audit).
  This limits how long a stolen refresh token stays useful.
- **Logout**: revokes the current refresh token and clears the cookie. It
  does not attempt to invalidate the still-live access token (by design —
  that's what the short access-token expiry is for).
- **Password hashing**: bcrypt, cost factor from `BCRYPT_SALT_ROUNDS` (12 by
  default).
- **Validation**: Zod schemas run through a generic `validate(schema)`
  middleware before the request reaches the controller — controllers never
  see malformed input.
- **Rate limiting**: `/auth/*` uses a tighter limiter
  (`AUTH_RATE_LIMIT_*`) than the rest of the API, to slow down
  credential-stuffing attempts.

## Endpoints

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | `{ email, password, role: 'OWNER'\|'TENANT', name, phone? }` |
| POST | `/api/v1/auth/login` | Public | `{ email, password }` |
| POST | `/api/v1/auth/refresh` | Public (cookie) | — |
| POST | `/api/v1/auth/logout` | Bearer token | — |
| GET | `/api/v1/auth/me` | Bearer token | — |

`ADMIN` accounts are intentionally **not** self-registerable through this
endpoint (`auth.service.js` rejects it) — provision admins via a seed script
or a protected admin-only endpoint later.

## Running it

```bash
cd backend
cp .env.example .env      # then fill in real secrets
npm install
npx prisma migrate dev --name init_auth
npm run dev
```

Quick manual test:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"supersecret1","role":"OWNER","name":"Jane Owner"}'
```

## Deliberate scope boundaries

- `OwnerProfile` / `TenantProfile` creation is **not** part of this module —
  per the API design, those are separate `POST /owners/profile` /
  `POST /tenants/profile` calls made after registration.
- Socket.io JWT handshake auth (`socketAuth.js`) reuses `verifyAccessToken`
  from `jwt.util.js` but isn't wired up here — that lands with the chat
  module.
- No admin-provisioning endpoint yet — add one guarded by
  `authenticate, authorize('ADMIN')` once the admin module starts.
