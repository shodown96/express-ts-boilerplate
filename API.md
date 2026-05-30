# API Guide

Developer reference for the App API. This guide covers authentication mechanics and the common endpoint flows a client needs to implement.

**Base URL:** `{{BASE_URL}}/api/v1`

---

## Authentication

Protected endpoints require a valid access token. The token is accepted in two ways — use whichever fits your client:

| Method | Format |
|---|---|
| Authorization header | `Authorization: Bearer <accessToken>` |
| HTTP-only cookie | Set automatically on sign-in; sent by the browser on subsequent requests |

**Token lifetimes**

| Token | Lifetime |
|---|---|
| `accessToken` | 14 days |
| `refreshToken` | 21 days |

When the access token expires, call `POST /auth/refresh-token` with the refresh token to get a new one without re-authenticating.

---

## Response Envelope

Every response follows the same shape:

```json
{
  "apiObject": "Account",
  "code": 200,
  "status": "success",
  "message": "Success",
  "result": {}
}
```

On error, the envelope uses `"status": "failure"` and the payload moves to an `"error"` field instead of `"result"`.

```json
{
  "apiObject": "Account",
  "code": 401,
  "status": "failure",
  "message": "Invalid credentials provided",
  "error": {}
}
```

---

## Flows

### 1. Email / Password Sign-Up

Use this flow when the user registers with an email address and password.

```
POST /auth/sign-up
Body: { name, email, password }

→ 201: { user, accessToken, refreshToken }
→ 400: email already registered, or missing fields
```

After sign-up, a welcome email is sent automatically. Store both tokens. The `user` object omits the internal `role` field.

---

### 2. Email / Password Sign-In

```
POST /auth/sign-in
Body: { email, password }

→ 200: { user, accessToken, refreshToken }
→ 401: invalid credentials
```

If the account was created via Google OAuth and has no password set, this endpoint returns a specific error message directing the user to sign in with Google.

**Admin context** — if the `Referer` header includes `"admin"`, the endpoint rejects non-admin accounts. Mobile clients can pass `?PLATFORM=<any>` to enforce the same restriction from the query string.

---

### 3. Google OAuth Sign-In

Use this flow when the user authenticates via Google. The client is responsible for completing the Google consent flow and obtaining an authorization `code`.

```
POST /oauth/google-sign-in
Body: { code }                      ← Google authorization code
Headers: Referer: <your-app-origin> ← used to build the redirect_uri

→ 200: { user, accessToken, refreshToken }
       Sets httpOnly auth cookie automatically
```

If no account exists for the Google email, one is created and a welcome email is sent. If an account exists, the `avatarUrl` is synced from Google.

The `user` object includes an `isAdmin` boolean derived from the internal role.

---

### 4. Token Refresh

Call this before making authenticated requests when the access token has expired.

```
POST /auth/refresh-token
Body: { refreshToken }

→ 200: { accessToken }
→ 401: invalid or missing refresh token
```

---

### 5. Sign-Out

```
POST /auth/sign-out
Auth: required

→ 200: clears the auth cookie
```

---

### 6. Email Verification

Send an OTP to the user's email and then verify it to mark the account as email-verified.

**Step 1 — send the code**

```
POST /auth/send-code
Body: { email }

→ 200: OTP sent
```

**Step 2 — verify the code** (authenticated)

```
POST /auth/verify-email
Auth: required
Body: { code }    ← 6-digit OTP

→ 200: email marked as verified
→ 401: invalid or expired OTP
```

The OTP expires after 10 minutes. The code is consumed on successful verification.

---

### 7. Forgot / Reset Password

Use this flow when an unauthenticated user needs to recover their account.

**Step 1 — request a reset OTP**

```
POST /auth/forgot-password
Body: { email }

→ 200: OTP sent (always, even if email not found — but 400 on missing field)
→ 400: account not found for that email
```

**Step 2 — validate the OTP** (optional pre-check)

```
POST /auth/verify-code
Body: { code }

→ 200: OTP is valid (not consumed)
→ 401: invalid or expired
```

This check does not consume the code. Use it to validate before showing the new-password UI.

**Step 3 — set the new password**

```
POST /auth/reset-password
Body: { email, code, password }

→ 200: password updated
→ 400: new password is the same as the current one
→ 401: invalid OTP
```

---

### 8. Change Password (Authenticated)

For a signed-in user who knows their current password.

```
POST /auth/change-password
Auth: required
Body: { password, newPassword }

→ 200: password changed
→ 400: new password is the same as current
→ 401: current password incorrect
```

---

### 9. Set Password (OAuth Accounts)

Accounts created via Google have no password. Use this to add one.

```
POST /auth/set-password
Auth: required
Body: { password }

→ 200: password set
→ 400: missing password
```

---

### 10. Email Availability Check

Check before showing the registration form whether an email is already taken.

```
POST /auth/check-email
Body: { email }

→ 200: email is available
→ 400: email already registered
```

---

### 11. User Profile

**Get profile**

```
GET /users/profile
Auth: required

→ 200: { id, name, email, whatsappNumber, avatarUrl, isAdmin, createdAt }
```

The `isAdmin` flag is derived from the internal role and is the only role indicator returned to the client.

**Update profile**

```
PATCH /users/profile
Auth: required
Body: { name?, whatsappNumber? }

→ 200: updated profile
```

---

## Error Reference

| Code | Meaning |
|---|---|
| 400 | Bad request — missing or invalid fields |
| 401 | Unauthorized — invalid credentials, expired/missing token, or banned account |
| 500 | Internal server error |

A 401 on a protected endpoint means either the token is missing, invalid, expired, or the account has been banned. In the ban case the response message will specifically indicate the account is banned.
