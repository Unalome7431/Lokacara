# Lokacara API Documentation

Welcome to the **Lokacara API Documentation**. Lokacara is a community event management and discovery platform. This document provides technical details of the RESTful API endpoints available in the application.

A pre-configured Postman Collection is available in the root directory as `Lokacara_API.postman_collection.json` which can be imported directly into Postman.

---

## Table of Contents
1. [General Information](#general-information)
2. [Authentication Flow](#authentication-flow)
3. [Error Handling](#error-handling)
4. [Module 1: Authentication](#module-1-authentication)
5. [Module 2: Discovery (Public)](#module-2-discovery-public)
6. [Module 3: User Profile](#module-3-user-profile)
7. [Module 4: Participant Flow](#module-4-participant-flow)
8. [Module 5: Organizer Hub](#module-5-organizer-hub)
9. [Module 6: E-Certificate Module](#module-6-e-certificate-module)
10. [Module 7: Admin Moderation](#module-7-admin-moderation)
11. [Module 8: Media Stream](#module-8-media-stream)
12. [Core Data Schemas](#core-data-schemas)

---

## General Information

### Base URL
All API requests must be prefixed with:
```http
http://localhost:8000/api
```

### Global Headers
Every API request should include the following headers:
- `Accept: application/json` (Ensures Laravel returns error responses as JSON instead of HTML redirects)
- `Content-Type: application/json` (Used for standard JSON requests)
- `Authorization: Bearer <token>` (Required for all protected endpoints)

---

## Authentication Flow

Lokacara uses **Laravel Sanctum** for token-based authentication.
1. **User Login / Registration**: Send credentials to `/auth/login` or `/auth/register`. Upon success, the server responds with a plain-text `token` string.
2. **Subsequent Requests**: Include the header `Authorization: Bearer <your_token_here>` in all protected API calls.
3. **Admin Actions**: Admins authenticate at `/admin/auth/login`. This issues an admin token equipped with the `admin:access` ability required for moderation endpoints.

---

## Error Handling

The API returns standard HTTP status codes:

| Status Code | Meaning | Description |
|---|---|---|
| `200 OK` | Success | Request succeeded and data is returned. |
| `201 Created` | Created | Resource successfully created. |
| `400 Bad Request` | Validation / Logic Error | Input invalid or logical constraints failed. |
| `401 Unauthorized` | Unauthenticated | Missing or invalid Sanctum token. |
| `403 Forbidden` | Authorization Failure | Insufficient permissions (e.g. non-admin, user suspended). |
| `404 Not Found` | Not Found | The requested resource does not exist. |
| `500 Server Error` | Server Error | Internal server issues. |

### Validation Error Format (422 Unprocessable Entity)
When input validation fails, the response takes this shape:
```json
{
  "message": "The password field is required. (and 1 more error)",
  "errors": {
    "password": [
      "The password field is required."
    ],
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

## Module 1: Authentication

### Register User
Create a new participant or organizer account.
- **Method**: `POST`
- **Path**: `/auth/register`
- **Authentication**: Public (Guest)
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `name` | String | Required, max 255 | The user's full name |
  | `email` | String | Required, email, unique | The unique email address |
  | `password` | String | Required, min 8, confirmed | Account password |
  | `password_confirmation` | String | Required | Must match `password` |

**Sample Request**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123",
  "password_confirmation": "securepassword123"
}
```

**Success Response (201 Created)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 12,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "created_at": "2026-05-23T12:00:00.000000Z",
    "updated_at": "2026-05-23T12:00:00.000000Z"
  },
  "token": "3|aBcDeFgHiJkLmNoP..."
}
```

---

### Login User
Authenticate an existing user and generate an API token.
- **Method**: `POST`
- **Path**: `/auth/login`
- **Authentication**: Public (Guest)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `email` | String | Required, email | User's email |
  | `password` | String | Required | User's password |

**Success Response (200 OK)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 12,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "suspended_at": null,
    "created_at": "2026-05-23T12:00:00.000000Z",
    "updated_at": "2026-05-23T12:00:00.000000Z"
  },
  "token": "4|xYz123..."
}
```
**Error Responses**:
- **401 Unauthorized**: `"message": "Invalid login details"`
- **403 Forbidden** (Suspended): `"message": "Your account is suspended."`

---

### Admin Login
Authenticate a system administrator and generate an admin-scoped token.
- **Method**: `POST`
- **Path**: `/admin/auth/login`
- **Authentication**: Public (Guest)
- **Request Body**:
  - Same as User Login.

**Success Response (200 OK)**:
```json
{
  "message": "Admin login successful",
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@example.com",
    "role": "admin",
    "created_at": "2026-05-23T00:00:00.000000Z",
    "updated_at": "2026-05-23T00:00:00.000000Z"
  },
  "token": "1|adminTokenPlaintext..."
}
```
**Error Response (403 Forbidden)**:
- Sent if user attempts admin login but does not possess the `admin` role. Returns: `{"message": "Unauthorized access"}`

---

### Forgot Password
Send a reset link to the user's email.
- **Method**: `POST`
- **Path**: `/auth/password/email`
- **Authentication**: Public (Guest)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `email` | String | Required, email, exists:users | Target email |

**Success Response (200 OK)**:
```json
{
  "message": "We have emailed your password reset link."
}
```

---

### Reset Password
Reset user password using the token received in email.
- **Method**: `POST`
- **Path**: `/auth/password/reset`
- **Authentication**: Public (Guest)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `token` | String | Required | Reset token from email |
  | `email` | String | Required, email, exists:users | Target email |
  | `password` | String | Required, min 8, confirmed | New password |
  | `password_confirmation` | String | Required | Must match `password` |

**Success Response (200 OK)**:
```json
{
  "message": "Your password has been reset."
}
```

---

### Google Login
Authenticate or register a user using a Google OAuth token.
- **Method**: `POST`
- **Path**: `/auth/google`
- **Authentication**: Public (Guest)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `token` | String | Required | Google OAuth ID Token |

**Success Response (200 OK)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": 12,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user"
  },
  "token": "5|googleTokenPlaintext..."
}
```

---

### Refresh Token
Refresh the current access token.
- **Method**: `POST`
- **Path**: `/auth/refresh`
- **Authentication**: Public (takes token in Authorization header)

**Success Response (200 OK)**:
```json
{
  "token": "6|newSanctumTokenPlaintext..."
}
```

---

### Logout User
Revoke the token that authenticated the current request.
- **Method**: `POST`
- **Path**: `/auth/logout`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

## Module 2: Discovery (Public)

### Get Categories
List all event categories.
- **Method**: `GET`
- **Path**: `/categories`
- **Authentication**: Public

**Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Technology",
    "created_at": "2026-05-23T12:00:00.000000Z",
    "updated_at": "2026-05-23T12:00:00.000000Z"
  }
]
```

---

### Get Locations
List all unique event locations.
- **Method**: `GET`
- **Path**: `/locations`
- **Authentication**: Public

**Success Response (200 OK)**:
```json
[
  "Jakarta",
  "Yogyakarta",
  "Bandung"
]
```

---

### Get Config Tabs
Retrieve discovery config tabs configuration.
- **Method**: `GET`
- **Path**: `/config/tabs`
- **Authentication**: Public

**Success Response (200 OK)**:
```json
[
  {
    "id": "all",
    "name": "Semua"
  },
  {
    "id": "tech",
    "name": "Teknologi"
  }
]
```

---

### Feed Events
Get a list of popular, upcoming events (minimum view count of 50), sorted by popularity.
- **Method**: `GET`
- **Path**: `/events/feed`
- **Authentication**: Public

**Success Response (200 OK)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Lokacara Hackathon 2026",
      "category_id": 2,
      "description": "A weekend full of coding...",
      "type": "offline",
      "location_name": "Tech Hub Center",
      "address": "123 Innovation Way",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "start_datetime": "2026-06-01 09:00:00",
      "end_datetime": "2026-06-03 18:00:00",
      "capacity": 200,
      "view_count": 120,
      "status": "published",
      "poster": "posters/default_hackathon.png",
      "created_at": "2026-05-20T10:00:00.000000Z",
      "category": { "id": 2, "name": "Technology" },
      "user": { "id": 5, "name": "Tech Organizer" }
    }
  ]
}
```

---

### Search Events
Search for upcoming events by keyword or category. Returns a paginated response.
- **Method**: `GET`
- **Path**: `/events/search`
- **Authentication**: Public
- **Query Parameters**:
  | Parameter | Type | Required? | Description |
  |---|---|---|---|
  | `keyword` | String | Optional | Match keywords in event title |
  | `category_id` | Integer | Optional | Filter by Category ID |
  | `page` | Integer | Optional | Pagination page index (default: 1) |

**Success Response (200 OK)**:
```json
{
  "current_page": 1,
  "data": [ ... ],
  "first_page_url": "http://localhost:8000/api/events/search?page=1",
  "from": 1,
  "last_page": 2,
  "last_page_url": "http://localhost:8000/api/events/search?page=2",
  "next_page_url": "http://localhost:8000/api/events/search?page=2",
  "path": "http://localhost:8000/api/events/search",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 28
}
```

---

### Get Event Details
Retrieve details of a single event. Increments `view_count` on unique views (anti-spam restriction: 2-hour cooldown per user/IP address).
- **Method**: `GET`
- **Path**: `/events/{event}`
- **Authentication**: Public / Sanctum optional (to check if registered)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "event": {
    "id": 1,
    "title": "Lokacara Hackathon 2026",
    "category_id": 2,
    "description": "A weekend full of coding...",
    "type": "offline",
    "location_name": "Tech Hub Center",
    "address": "123 Innovation Way",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "start_datetime": "2026-06-01 09:00:00",
    "end_datetime": "2026-06-03 18:00:00",
    "capacity": 200,
    "view_count": 121,
    "status": "published",
    "poster": "posters/default_hackathon.png",
    "created_at": "2026-05-20T10:00:00.000000Z",
    "category": { "id": 2, "name": "Technology" },
    "user": { "id": 5, "name": "Tech Organizer" }
  },
  "is_registered": false
}
```

---

## Module 3: User Profile

### Get Authenticated User
Returns the logged-in user object straight from the request.
- **Method**: `GET`
- **Path**: `/user`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
{
  "id": 12,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "avatar_url": "avatars/abc.png",
  "created_at": "2026-05-23T12:00:00.000000Z",
  "updated_at": "2026-05-23T12:15:00.000000Z"
}
```

---

### Get Profile
Retrieve the authenticated user's profile.
- **Method**: `GET`
- **Path**: `/profile`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
{
  "user": {
    "id": 12,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "avatar_url": "avatars/abc.png",
    "created_at": "2026-05-23T12:00:00.000000Z"
  }
}
```

---

### Update Profile
Update user profile information (name, email, or avatar).
- **Method**: `PATCH`
- **Path**: `/profile`
- **Authentication**: Bearer Token (Sanctum)
- **Headers**:
  - `Content-Type: application/json` or `multipart/form-data` if uploading file
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `name` | String | Optional, required if present | User's full name |
  | `email` | String | Optional, required if present, email, unique except current user | User's email |
  | `avatar` | File | Optional, image, max 5MB | Avatar image file |

**Success Response (200 OK)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 12,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "avatar_url": "avatars/xyz.png",
    "updated_at": "2026-05-23T12:20:00.000000Z"
  }
}
```

---

### Upload Avatar
Upload user profile avatar.
- **Method**: `POST`
- **Path**: `/profile/avatar`
- **Authentication**: Bearer Token (Sanctum)
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `avatar` | File | Required, image, max 5MB | Avatar image file |

**Success Response (200 OK)**:
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "avatars/new_avatar.jpg",
  "user": {
    "id": 12,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "avatar_url": "avatars/new_avatar.jpg"
  }
}
```

---

### Get Avatar File
Streams/renders the user avatar stored on disk.
- **Method**: `GET`
- **Path**: `/profile/avatar/{filename}`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{filename}`: The filename of the avatar (e.g. `xyz.png`)

**Success Response**: Streams raw image content (e.g., `image/png`, `image/jpeg`).

---

### Update User Settings
Update notification and privacy settings for the authenticated user.
- **Method**: `PATCH`
- **Path**: `/user/settings`
- **Authentication**: Bearer Token (Sanctum)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `push_notifications` | Boolean | Optional | Enable/disable push notifications |
  | `email_notifications` | Boolean | Optional | Enable/disable email notifications |

**Success Response (200 OK)**:
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "push_notifications": true,
    "email_notifications": false
  }
}
```

---

### Register Push Token
Save Firebase Cloud Messaging push token for user devices.
- **Method**: `POST`
- **Path**: `/user/push-tokens`
- **Authentication**: Bearer Token (Sanctum)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `token` | String | Required | FCM Push Token |

**Success Response (200 OK)**:
```json
{
  "message": "Push token registered successfully"
}
```

---

### Remove Push Token
De-register push token when user logs out or disables notifications.
- **Method**: `DELETE`
- **Path**: `/user/push-tokens`
- **Authentication**: Bearer Token (Sanctum)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `token` | String | Required | FCM Push Token to remove |

**Success Response (200 OK)**:
```json
{
  "message": "Push token removed successfully"
}
```

---

## Module 4: Participant Flow

### Get Dashboard
Retrieve dashboard details for the logged-in user, containing joined events, hosted events, and issued certificates.
- **Method**: `GET`
- **Path**: `/dashboard`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
{
  "joined_events": [
    {
      "id": 4,
      "user_id": 12,
      "event_id": 1,
      "registered_at": "2026-05-23 12:10:00",
      "status": "confirmed",
      "event": {
        "id": 1,
        "title": "Lokacara Hackathon 2026",
        "start_datetime": "2026-06-01 09:00:00"
      }
    }
  ],
  "hosted_events": [
    {
      "id": 8,
      "title": "Personal Code Camp",
      "user_id": 12,
      "start_datetime": "2026-07-10 10:00:00"
    }
  ],
  "certificates": [
    {
      "id": 1,
      "registration_id": 4,
      "file_url": "certificates/cert_1.jpg",
      "issued_at": "2026-06-04 15:00:00",
      "event_registration": {
        "id": 4,
        "event": {
          "id": 1,
          "title": "Lokacara Hackathon 2026"
        }
      }
    }
  ]
}
```

---

### Join Event
Register for an upcoming event. This creates a registration record and generates a unique UUID QR token.
- **Method**: `POST`
- **Path**: `/events/{event}/join`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "message": "Successfully joined the event!"
}
```
**Error Response (400 Bad Request)**:
- Sent if already registered: `{"message": "Already joined this event."}`

---

### Undo Join (Leave Event)
Cancel registration for an event.
- **Method**: `DELETE`
- **Path**: `/events/{event}/join`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "message": "Successfully left the event!"
}
```
**Error Response (404 Not Found)**:
- Sent if not registered: `{"message": "Not registered for this event."}`

---

### Get QR Attendance Ticket
Retrieve the user's registration details containing the QR token for check-in.
- **Method**: `GET`
- **Path**: `/events/{event}/attendance/qr`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "event": {
    "id": 1,
    "title": "Lokacara Hackathon 2026"
  },
  "registration": {
    "id": 4,
    "user_id": 12,
    "event_id": 1,
    "qr_token": "c09f3b8b-e85d-4f36-8153-90d5718a38ee",
    "status": "confirmed",
    "checked_in_at": null
  }
}
```

---

### Report Event
Submit a report flags inappropriate event details.
- **Method**: `POST`
- **Path**: `/events/{event}/report`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `reason` | String | Required, max 500 | Explanation for reporting |

**Success Response (201 Created)**:
```json
{
  "message": "Event reported successfully"
}
```

---

### Get Bookmarks
Get a list of events bookmarked by the user.
- **Method**: `GET`
- **Path**: `/bookmarks`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "title": "Lokacara Hackathon 2026",
    "description": "A weekend full of coding...",
    "type": "offline"
  }
]
```

---

### Bookmark Event
Add an event to the user's bookmarks list.
- **Method**: `POST`
- **Path**: `/bookmarks/{event}`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "message": "Event bookmarked successfully"
}
```

---

### Remove Bookmark
Remove an event from the user's bookmarks list.
- **Method**: `DELETE`
- **Path**: `/bookmarks/{event}`
- **Authentication**: Bearer Token (Sanctum)
- **URL Parameters**:
  - `{event}`: Event ID (Integer)

**Success Response (200 OK)**:
```json
{
  "message": "Bookmark removed successfully"
}
```

---

### Get Notifications
Retrieve user notifications.
- **Method**: `GET`
- **Path**: `/notifications`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**:
```json
[
  {
    "id": "notification-uuid-1",
    "type": "App\\Notifications\\EventUpdated",
    "data": {
      "title": "Event diupdate",
      "body": "Event Lokacara Hackathon 2026 telah mengalami perubahan."
    },
    "read_at": null,
    "created_at": "2026-06-19T00:00:00.000000Z"
  }
]
```
**Error Responses (400 Bad Request)**:
- Already reported: `{"message": "You already have a pending report for this event."}`
- Event banned/cancelled: `{"message": "This event cannot be reported anymore."}`

---

## Module 5: Organizer Hub

### Get Organizer Events
Retrieve a list of events hosted by the authenticated organizer.
- **Method**: `GET`
- **Path**: `/organizer/events`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**: Paginated Event objects list (standard pagination schema).

---

### Create Event
Create a new online or offline event.
- **Method**: `POST`
- **Path**: `/organizer/events`
- **Authentication**: Bearer Token (Sanctum)
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `title` | String | Required, max 255 | Title of the event |
  | `category_id` | Integer | Nullable, exists:categories,id | Category link |
  | `description` | String | Required | Event details markdown/text |
  | `type` | String | Required, `online` or `offline` | Delivery mechanism |
  | `location_name` | String | Required if type=offline, max 255 | Venue name |
  | `address` | String | Required if type=offline | Venue street address |
  | `latitude` | Numeric | Required if type=offline, -90 to 90 | Venue GPS latitude |
  | `longitude` | Numeric | Required if type=offline, -180 to 180 | Venue GPS longitude |
  | `platform_name` | String | Required if type=online, max 255 | Online platform (Zoom, Meet) |
  | `link` | String | Required if type=online, URL, max 255 | Link to join online |
  | `start_datetime` | Date | Required | Start time (`YYYY-MM-DD HH:MM:SS`) |
  | `end_datetime` | Date | Required, after or equal to start | End time (`YYYY-MM-DD HH:MM:SS`) |
  | `capacity` | Integer | Nullable, min 1 | Max attendee capacity |
  | `poster` | File | Required on create, image (jpeg, png, jpg, webp), max 5MB | Event banner |

**Success Response (201 Created)**:
```json
{
  "message": "Event created successfully",
  "event": {
    "id": 15,
    "title": "Interactive Tech Summit 2026",
    "description": "An awesome coding conference...",
    "type": "offline",
    "location_name": "Grand Ballroom, Fairmont Hotel",
    "address": "80 Bras Basah Rd, Singapore",
    "latitude": 1.3008,
    "longitude": 103.8523,
    "start_datetime": "2026-08-15 09:00:00",
    "end_datetime": "2026-08-15 17:00:00",
    "capacity": 150,
    "poster": "posters/some_hash_name.png",
    "user_id": 12,
    "status": "published",
    "created_at": "2026-05-23T12:30:00.000000Z"
  }
}
```

---

### Update Event
Modify details of an event.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body**:
  - Same parameters as Event Creation, except `poster` is optional (`nullable`).
  - **IMPORTANT (Method Spoofing)**: Since PHP cannot parse multipart payload data on native `PUT`/`PATCH` requests directly, client requests must send a `POST` request and include the field:
    `_method` = `PUT` (or `PATCH`)

**Success Response (200 OK)**:
```json
{
  "message": "Event updated successfully",
  "event": {
    "id": 15,
    "title": "Interactive Tech Summit 2026 - Updated Title",
    ...
  }
}
```

---

### Delete Event
Delete an event, along with its stored poster file.
- **Method**: `DELETE`
- **Path**: `/organizer/events/{event}`
- **Authentication**: Bearer Token (Sanctum - Organizer of event OR Admin)

**Success Response (200 OK)**:
```json
{
  "message": "Event deleted successfully"
}
```

---

### Get Attendees List
List registrations of users attending the event.
- **Method**: `GET`
- **Path**: `/organizer/events/{event}/attendees`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **Query Parameters**:
  - `page`: Page index (default: 1)

**Success Response (200 OK)**:
```json
{
  "event": {
    "id": 15,
    "title": "Interactive Tech Summit 2026"
  },
  "attendees": {
    "current_page": 1,
    "data": [
      {
        "id": 4,
        "user_id": 12,
        "event_id": 15,
        "status": "confirmed",
        "checked_in_at": null,
        "user": {
          "id": 12,
          "name": "Jane Doe",
          "email": "jane.doe@example.com",
          "avatar_url": "avatars/xyz.png"
        }
      }
    ],
    "per_page": 15,
    "total": 1
  }
}
```

---

### Scan Attendance QR Code
Scan a participant's UUID QR token and check them in as present.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}/attendance/scan`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `qr_token` | String | Required, UUID | Participant's QR token |

**Success Response (200 OK)**:
```json
{
  "message": "User Jane Doe successfully checked in.",
  "registration": {
    "id": 4,
    "user_id": 12,
    "event_id": 15,
    "status": "present",
    "checked_in_at": "2026-05-23 12:40:00"
  }
}
```
**Error Responses**:
- **400 Bad Request** (Already checked-in): `{"message": "User Jane Doe has already checked in."}`
- **404 Not Found** (Invalid token): `{"message": "Invalid QR Token for this event."}`

---

### Toggle Attendance (Manual Override)
Manually check in or check out a registered attendee.
- **Method**: `PATCH`
- **Path**: `/organizer/events/{event}/attendance/{registration}/toggle`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **URL Parameters**:
  - `{event}`: Event ID
  - `{registration}`: Registration ID (EventRegistration model ID)

**Success Response (200 OK)**:
```json
{
  "message": "Attendance manually checked in.",
  "registration": {
    "id": 4,
    "status": "present",
    "checked_in_at": "2026-05-23 12:45:00"
  }
}
```
*Note: Toggle works symmetrically. Toggling an already checked-in registration sets checked_in_at back to `null` and status to `registered`.*

---

### Send Event Reminders
Triggers email notifications to remind all confirmed/registered attendees about the upcoming event. Dispatched as a queued job.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}/reminders`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)

**Success Response (200 OK)**:
```json
{
  "message": "Email reminders are being sent in the background."
}
```

---

### Cancel Event
Cancel a scheduled event, sending notifications and processing potential refunds.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}/cancel`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)

**Success Response (200 OK)**:
```json
{
  "message": "Event cancelled successfully."
}
```
**Error Responses**:
- **400 Bad Request** (Already started): `{"message": "Cannot cancel an event that has already started."}`
- **400 Bad Request** (Already cancelled): `{"message": "Event is already cancelled."}`
- **403 Forbidden**: `{"message": "Forbidden"}`

---

## Module 6: E-Certificate Module

### Upload Template
Upload a template background image for generating participant certificates.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}/certificates/template`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **Headers**:
  - `Content-Type: multipart/form-data`
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `template` | File | Required, image (jpeg, png, jpg), max 5MB | Certificate template layout |

**Success Response (200 OK)**:
```json
{
  "message": "Template uploaded successfully",
  "template_path": "event-templates/1/some_temp_file_hash.png"
}
```

---

### Distribute Certificates
Triggers a queued background job (`DistributeCertificatesJob`) to construct certificate images and distribute them to all participants.
- **Method**: `POST`
- **Path**: `/organizer/events/{event}/certificates/distribute`
- **Authentication**: Bearer Token (Sanctum - Must be organizer of this event)
- **Request Body**:
  | Field | Type | Rules | Description |
  |---|---|---|---|
  | `template_path` | String | Required | Path returned from Upload Template |
  | `font_family` | String | Required | Font style family name |
  | `font_color` | String | Required | Font hex color, e.g., `#111111` |
  | `font_size` | String | Required, `Small`, `Medium`, or `Large` | Name size category |
  | `x_pos` | Numeric | Required, min 0, max 100 | X-Coordinate offset (percentage) |
  | `is_x_center` | Boolean | Required | Center text horizontally? |
  | `y_pos` | Numeric | Required, min 0, max 100 | Y-Coordinate offset (percentage) |
  | `is_y_center` | Boolean | Required | Center text vertically? |

**Success Response (200 OK)**:
```json
{
  "message": "Certificates are being generated and distributed."
}
```
**Error Response (404 Not Found)**:
- Template path invalid: `{"message": "Template file not found."}`

---

### Participant Download Certificate
Fetch and download the generated certificate image file for an event.
- **Method**: `GET`
- **Path**: `/events/{event}/certificate`
- **Authentication**: Bearer Token (Sanctum)

**Success Response (200 OK)**: Downloads file content as `certificate.jpg`.
**Error Responses (404 Not Found)**:
- Not registered: `{"message": "You are not registered for this event."}`
- Not issued: `{"message": "Certificate not found or not issued yet."}`
- File missing: `{"message": "Certificate file is missing from storage."}`

---

## Module 7: Admin Moderation

All endpoints below require a token with `admin:access` capability (issued during Admin Login).

### Get Admin Moderation Queue
Retrieve a paginated list of all event reports.
- **Method**: `GET`
- **Path**: `/admin/moderation`
- **Authentication**: Bearer Token (Sanctum - Admin role required)
- **Query Parameters**:
  - `page`: Page index (default: 1)

**Success Response (200 OK)**: Paginated EventReport list.

---

### Get Report Details
Retrieve complete details of a specific report.
- **Method**: `GET`
- **Path**: `/admin/reports/{report}`
- **Authentication**: Bearer Token (Sanctum - Admin role required)

**Success Response (200 OK)**:
```json
{
  "data": {
    "id": 1,
    "event_id": 15,
    "reporter_id": 12,
    "reason": "Inappropriate event content",
    "status": "pending",
    "created_at": "2026-05-23T12:00:00.000000Z",
    "user": {
      "id": 12,
      "name": "Jane Doe",
      "email": "jane.doe@example.com"
    },
    "event": {
      "id": 15,
      "title": "Interactive Tech Summit 2026",
      "user_id": 5,
      "user": {
        "id": 5,
        "name": "Tech Organizer",
        "email": "organizer@example.com"
      }
    }
  }
}
```

---

### Ban Event
Bans an event. This updates the status of the event to `banned`, marks pending reports as `resolved`, sends email notifications to the organizer and participants, and cancels all registrations.
- **Method**: `POST`
- **Path**: `/admin/events/{event}/ban`
- **Authentication**: Bearer Token (Sanctum - Admin role required)

**Success Response (200 OK)**:
```json
{
  "message": "Event has been successfully banned, participants removed, and organizer notified"
}
```
**Error Response (400 Bad Request)**:
- Event already banned: `{"message": "Event is already banned."}`

---

### Ban User
Revokes the user's tokens, bans the user (by deleting their user record).
- **Method**: `POST`
- **Path**: `/admin/users/{user}/ban`
- **Authentication**: Bearer Token (Sanctum - Admin role required)

**Success Response (200 OK)**:
```json
{
  "message": "User access has been revoked"
}
```
**Error Response (400 Bad Request)**:
- Self-banning: `{"message": "You cannot ban yourself."}`

---

## Module 8: Media Stream

### Get Poster Image
Serves static event posters directly with aggressive caching headers.
- **Method**: `GET`
- **Path**: `/posters/{filename}`
- **Authentication**: Public
- **Headers Returned**:
  - `Cache-Control: public, max-age=31536000` (1-year client caching)

**Success Response (200 OK)**: Returns the raw image binary.

---

## Core Data Schemas

For reference when integrating, these are the schema representation structures mapping to JSON keys:

### User
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@example.com",
  "role": "user", // "user" or "admin"
  "avatar_url": "avatars/filename.png", // or null
  "suspended_at": null // datetime or null
}
```

### Event
```json
{
  "id": 1,
  "title": "Event Name",
  "category_id": 1,
  "description": "Event detail text",
  "type": "offline", // "online" or "offline"
  "location_name": "Venue Name", // or null
  "address": "Street Address", // or null
  "latitude": 1.234, // or null
  "longitude": 103.567, // or null
  "platform_name": "Zoom", // or null
  "link": "https://...", // or null
  "start_datetime": "2026-08-15 09:00:00",
  "end_datetime": "2026-08-15 17:00:00",
  "capacity": 100, // or null
  "view_count": 10,
  "status": "published", // "published" or "banned"
  "poster": "posters/filename.png"
}
```

### EventRegistration
```json
{
  "id": 1,
  "user_id": 2,
  "event_id": 1,
  "registered_at": "2026-05-23 12:00:00",
  "qr_token": "uuid-token-string",
  "status": "confirmed", // "confirmed", "present", "cancelled"
  "checked_in_at": null // datetime or null
}
```

### EventReport
```json
{
  "id": 1,
  "event_id": 1,
  "reporter_id": 2,
  "reason": "Report text details",
  "status": "pending", // "pending" or "resolved"
  "created_at": "datetime"
}
```

### Certificate
```json
{
  "id": 1,
  "registration_id": 1,
  "file_url": "certificates/filename.jpg",
  "issued_at": "datetime"
}
```
