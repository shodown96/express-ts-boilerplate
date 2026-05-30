# App API

REST API powering the App platform — authentication, OAuth, and user account management.

---

## Resources

| | |
|---|---|
| [API Guide]({{BASE_URL}}/api/docs/guide) | Endpoint flows for frontend and mobile developers |
| [Swagger UI]({{BASE_URL}}/api/docs) | Interactive explorer with live "Try it out" |
| [OpenAPI Spec]({{BASE_URL}}/api/docs/openapi.json) | JSON schema — import into Postman or generate a typed client |

---

## Base URL

All versioned endpoints are prefixed with `/api/v1`.

```
{{BASE_URL}}/api/v1
```

---

## Root Endpoint

`GET /` returns the current API version and links to documentation.

```json
{
  "apiObject": "Base",
  "code": 200,
  "status": "success",
  "message": "Welcome to App API",
  "result": {
    "version": "1.0.0",
    "docs": "{{BASE_URL}}/api/docs",
    "openapi": "{{BASE_URL}}/api/docs/openapi.json",
    "guide": "{{BASE_URL}}/api/docs/guide"
  }
}
```

---

## Versioning

The current API version is **v1**. The version is encoded in the URL path (`/api/v1/...`) and the `version` field on the root response. Breaking changes will be introduced under a new version prefix.
