# Shamash API Documentation

Complete reference for the Shamash REST API.

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT token in httpOnly cookie

---

## Table of Contents

- [Authentication](#authentication)
- [Members](#members)
- [Aliyot](#aliyot)
- [Donations](#donations)
- [Expenses](#expenses)
- [Events](#events)
- [Error Handling](#error-handling)

---

## Authentication

### POST /auth/login

Authenticate a user and receive a JWT cookie.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@shamash.app",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@shamash.app",
    "role": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### POST /auth/logout

Logout the current user.

**Request:**
```http
POST /api/auth/logout
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### GET /auth/me

Get the current authenticated user.

**Request:**
```http
GET /api/auth/me
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "admin@shamash.app",
    "role": "admin"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## Members

### GET /members

List all members.

**Request:**
```http
GET /api/members
Cookie: token=<jwt-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Filter by name |
| role | string | Filter by role (kohen, levi, yisrael) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ישראל ישראלי",
      "phone": "050-1234567",
      "email": "israel@example.com",
      "role": "yisrael",
      "yahrzeitDate": "12-05",
      "notes": "תושב השכונה",
      "photo": "data:image/jpeg;base64,...",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST /members

Create a new member.

**Request:**
```http
POST /api/members
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "name": "ישראל ישראלי",
  "phone": "050-1234567",
  "email": "israel@example.com",
  "role": "yisrael",
  "yahrzeitDate": "12-05",
  "notes": "תושב השכונה",
  "photo": "data:image/jpeg;base64,..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ישראל ישראלי",
    "phone": "050-1234567",
    "email": "israel@example.com",
    "role": "yisrael",
    "yahrzeitDate": "12-05",
    "notes": "תושב השכונה",
    "photo": "data:image/jpeg;base64,...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Name is required"
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "error": "Forbidden"
}
```

---

### GET /members/:id

Get a specific member.

**Request:**
```http
GET /api/members/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ישראל ישראלי",
    "phone": "050-1234567",
    "email": "israel@example.com",
    "role": "yisrael",
    "yahrzeitDate": "12-05",
    "notes": "תושב השכונה",
    "photo": "data:image/jpeg;base64,...",
    "createdAt": "2024-01-15T10:30:00Z",
    "aliyot": [...],
    "donations": [...]
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Member not found"
}
```

---

### PUT /members/:id

Update a member.

**Request:**
```http
PUT /api/members/1
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "name": "ישראל ישראלי",
  "phone": "050-7654321",
  "email": "israel@example.com",
  "role": "yisrael",
  "notes": "מעודכן"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "ישראל ישראלי",
    "phone": "050-7654321",
    "email": "israel@example.com",
    "role": "yisrael",
    "notes": "מעודכן",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /members/:id

Delete a member.

**Request:**
```http
DELETE /api/members/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Aliyot

### GET /aliyot

List all aliyot.

**Request:**
```http
GET /api/aliyot
Cookie: token=<jwt-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| date | string | Filter by date (ISO format) |
| memberId | number | Filter by member |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 1,
      "date": "2024-01-20T00:00:00Z",
      "type": "kohen",
      "parasha": "שמות",
      "assigned": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "member": {
        "id": 1,
        "name": "ישראל ישראלי",
        "role": "kohen"
      }
    }
  ]
}
```

---

### POST /aliyot

Create a new aliyah.

**Request:**
```http
POST /api/aliyot
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "memberId": 1,
  "date": "2024-01-20",
  "type": "shlishi",
  "parasha": "שמות",
  "assigned": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "date": "2024-01-20T00:00:00Z",
    "type": "shlishi",
    "parasha": "שמות",
    "assigned": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /aliyot/:id

Get a specific aliyah.

**Request:**
```http
GET /api/aliyot/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "date": "2024-01-20T00:00:00Z",
    "type": "shlishi",
    "parasha": "שמות",
    "assigned": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "member": {
      "id": 1,
      "name": "ישראל ישראלי"
    }
  }
}
```

---

### PUT /aliyot/:id

Update an aliyah.

**Request:**
```http
PUT /api/aliyot/1
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "type": "shlishi",
  "parasha": "וארא",
  "assigned": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "date": "2024-01-20T00:00:00Z",
    "type": "shlishi",
    "parasha": "וארא",
    "assigned": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /aliyot/:id

Delete an aliyah.

**Request:**
```http
DELETE /api/aliyot/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Donations

### GET /donations

List all donations.

**Request:**
```http
GET /api/donations
Cookie: token=<jwt-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| memberId | number | Filter by member |
| paid | boolean | Filter by payment status |
| from | string | Start date (ISO) |
| to | string | End date (ISO) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "memberId": 1,
      "amount": 180.0,
      "description": "תרומה לקידוש",
      "paid": true,
      "date": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z",
      "member": {
        "id": 1,
        "name": "ישראל ישראלי"
      }
    }
  ]
}
```

---

### POST /donations

Create a new donation.

**Request:**
```http
POST /api/donations
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "memberId": 1,
  "amount": 180.0,
  "description": "תרומה לקידוש",
  "paid": true,
  "date": "2024-01-15"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "amount": 180.0,
    "description": "תרומה לקידוש",
    "paid": true,
    "date": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /donations/:id

Get a specific donation.

**Request:**
```http
GET /api/donations/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "amount": 180.0,
    "description": "תרומה לקידוש",
    "paid": true,
    "date": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "member": {
      "id": 1,
      "name": "ישראל ישראלי"
    }
  }
}
```

---

### PUT /donations/:id

Update a donation.

**Request:**
```http
PUT /api/donations/1
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "amount": 360.0,
  "paid": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "memberId": 1,
    "amount": 360.0,
    "description": "תרומה לקידוש",
    "paid": true,
    "date": "2024-01-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /donations/:id

Delete a donation.

**Request:**
```http
DELETE /api/donations/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Expenses

### GET /expenses

List all expenses.

**Request:**
```http
GET /api/expenses
Cookie: token=<jwt-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| paid | boolean | Filter by payment status |
| from | string | Start date (ISO) |
| to | string | End date (ISO) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "food",
      "payee": "מסעדת השכונה",
      "description": "קידוש שבת",
      "amount": 500.0,
      "paid": true,
      "date": "2024-01-15T00:00:00Z",
      "notes": "ל-50 איש",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### POST /expenses

Create a new expense.

**Request:**
```http
POST /api/expenses
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "category": "food",
  "payee": "מסעדת השכונה",
  "description": "קידוש שבת",
  "amount": 500.0,
  "paid": false,
  "date": "2024-01-15",
  "notes": "ל-50 איש"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "food",
    "payee": "מסעדת השכונה",
    "description": "קידוש שבת",
    "amount": 500.0,
    "paid": false,
    "date": "2024-01-15T00:00:00Z",
    "notes": "ל-50 איש",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Categories:** `cantor`, `rabbi`, `food`, `maintenance`, `utilities`, `equipment`, `salary`, `other`

---

### GET /expenses/:id

Get a specific expense.

**Request:**
```http
GET /api/expenses/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "food",
    "payee": "מסעדת השכונה",
    "description": "קידוש שבת",
    "amount": 500.0,
    "paid": false,
    "date": "2024-01-15T00:00:00Z",
    "notes": "ל-50 איש",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT /expenses/:id

Update an expense.

**Request:**
```http
PUT /api/expenses/1
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "paid": true,
  "notes": "שולם במזומן"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "food",
    "payee": "מסעדת השכונה",
    "description": "קידוש שבת",
    "amount": 500.0,
    "paid": true,
    "date": "2024-01-15T00:00:00Z",
    "notes": "שולם במזומן",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /expenses/:id

Delete an expense.

**Request:**
```http
DELETE /api/expenses/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Events

### GET /events

List all events.

**Request:**
```http
GET /api/events
Cookie: token=<jwt-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | string | Start date (ISO) |
| to | string | End date (ISO) |
| type | string | Filter by type |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "שיעור תורה",
      "date": "2024-01-20T19:00:00Z",
      "description": "שיעור בענייני דיומא",
      "type": "service",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Types:** `service`, `holiday`, `meeting`, `general`

---

### POST /events

Create a new event.

**Request:**
```http
POST /api/events
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "title": "שיעור תורה",
  "date": "2024-01-20T19:00:00Z",
  "description": "שיעור בענייני דיומא",
  "type": "service"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "שיעור תורה",
    "date": "2024-01-20T19:00:00Z",
    "description": "שיעור בענייני דיומא",
    "type": "service",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT /events/:id

Update an event.

**Request:**
```http
PUT /api/events/1
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "title": "שיעור תורה - עודכן",
  "description": "שיעור בגמרא"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "שיעור תורה - עודכן",
    "date": "2024-01-20T19:00:00Z",
    "description": "שיעור בגמרא",
    "type": "service",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### DELETE /events/:id

Delete an event.

**Request:**
```http
DELETE /api/events/1
Cookie: token=<jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE" // Optional
}
```

### Common Errors

| Error Code | HTTP | Description |
|------------|------|-------------|
| UNAUTHORIZED | 401 | JWT token missing or invalid |
| FORBIDDEN | 403 | User lacks required role |
| NOT_FOUND | 404 | Resource ID doesn't exist |
| VALIDATION_ERROR | 400 | Input validation failed |
| DUPLICATE_EMAIL | 400 | Email already exists |

### Validation Errors

When validation fails:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Name is required",
    "email": "Invalid email format"
  }
}
```

---

## Rate Limiting

Currently not implemented. Planned for future versions.

---

## WebSocket Events

The WebSocket server broadcasts real-time events at `ws://localhost:3001`.

### Join Room

```json
{
  "type": "join_room",
  "room": "synagogue-1"
}
```

### Broadcast Event

```json
{
  "type": "broadcast",
  "room": "synagogue-1",
  "event": "member_created",
  "payload": { "id": 1, "name": "..." }
}
```

### Event Types

| Event | Description |
|-------|-------------|
| `member_created` | New member added |
| `member_updated` | Member info changed |
| `member_deleted` | Member removed |
| `aliyah_created` | New aliyah assigned |
| `aliyah_updated` | Aliyah changed |
| `aliyah_deleted` | Aliyah removed |
| `donation_created` | New donation recorded |
| `donation_updated` | Donation updated |
| `donation_deleted` | Donation removed |
| `expense_created` | New expense added |
| `expense_updated` | Expense updated |
| `expense_deleted` | Expense removed |
| `event_created` | New event scheduled |
| `event_updated` | Event changed |
| `event_deleted` | Event cancelled |

---

## SDK Example

### TypeScript/JavaScript

```typescript
const API_URL = 'http://localhost:3000/api';

async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error);
  }
  
  return data;
}

// Usage examples:

// Login
const login = await apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'admin@shamash.app',
    password: 'admin123'
  })
});

// Get members
const members = await apiRequest('/members');

// Create member
const newMember = await apiRequest('/members', {
  method: 'POST',
  body: JSON.stringify({
    name: 'ישראל ישראלי',
    role: 'yisrael'
  })
});

// Update member
await apiRequest('/members/1', {
  method: 'PUT',
  body: JSON.stringify({
    phone: '050-1234567'
  })
});

// Delete member
await apiRequest('/members/1', {
  method: 'DELETE'
});
```

---

**Last Updated:** 2024-01-15  
**API Version:** 1.0.0
