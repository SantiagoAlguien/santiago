# Santiagoback API Documentation

This document provides examples of request and response JSON formats for all API endpoints in the Santiagoback application.

## Base URL
```
http://localhost:8080
```

## Authentication

### Login
**POST** `/api/auth/login`

#### Request
```json
{
    "username": "testuser",
    "password": "testpass123"
}
```

#### Response (200 OK)
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "testuser",
    "email": "testuser@example.com",
    "role": "ADMIN"
}
```

## Users

### Register User
**POST** `/api/users/register`

#### Request
```json
{
    "username": "newuser",
    "password": "newpass123",
    "email": "newuser@example.com",
    "role": "USER"
}
```

#### Response (200 OK)
```json
{
    "id": 2,
    "username": "newuser",
    "password": "$2a$10$EncryptedPasswordHash",
    "email": "newuser@example.com",
    "role": "USER"
}
```

## Sections

### Get All Sections
**GET** `/api/sections`

#### Response (200 OK)
```json
[
    {
        "id": 1,
        "name": "Technology",
        "description": "Articles about technology and innovation",
        "blogIds": [1, 2],
        "imagesUrl": []
    },
    {
        "id": 2,
        "name": "Science",
        "description": "Scientific discoveries and research",
        "blogIds": [3],
        "imagesUrl": ["http://example.com/image1.jpg"]
    }
]
```

### Get Section by ID
**GET** `/api/sections/{id}`

#### Response (200 OK)
```json
{
    "id": 1,
    "name": "Technology",
    "description": "Articles about technology and innovation",
    "blogIds": [1, 2],
    "imagesUrl": []
}
```

### Create Section
**POST** `/api/sections`

#### Request
```json
{
    "name": "Programming",
    "description": "Articles about programming languages and software development",
    "blogIds": [1, 4],
    "imagesUrl": ["http://example.com/prog1.jpg", "http://example.com/prog2.jpg"]
}
```

#### Response (200 OK)
```json
{
    "id": 3,
    "name": "Programming",
    "description": "Articles about programming languages and software development",
    "blogIds": [1, 4],
    "imagesUrl": ["http://example.com/prog1.jpg", "http://example.com/prog2.jpg"]
}
```

### Update Section
**PUT** `/api/sections/{id}`

#### Request
```json
{
    "name": "Updated Section Name",
    "description": "Updated description",
    "blogIds": [2],
    "imagesUrl": ["http://example.com/new-image.jpg"]
}
```

#### Response (200 OK)
```json
{
    "id": 1,
    "name": "Updated Section Name",
    "description": "Updated description",
    "blogIds": [2],
    "imagesUrl": ["http://example.com/new-image.jpg"]
}
```

### Delete Section
**DELETE** `/api/sections/{id}`

#### Response (204 No Content)
*(No response body)*

## Blogs

### Get All Blogs
**GET** `/api/blogs`

#### Response (200 OK)
```json
[
    {
        "id": 1,
        "title": "Introduction to Spring Boot",
        "content": "Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications.",
        "sectionIds": [1, 3],
        "userId": 1,
        "imagesUrl": ["http://example.com/spring1.jpg"],
        "duracion": "10 min read"
    },
    {
        "id": 2,
        "title": "Advanced Java Concepts",
        "content": "Deep dive into advanced Java programming concepts.",
        "sectionIds": [1],
        "userId": 1,
        "imagesUrl": [],
        "duracion": "15 min read"
    }
]
```

### Get Blog by ID
**GET** `/api/blogs/{id}`

#### Response (200 OK)
```json
{
    "id": 1,
    "title": "Introduction to Spring Boot",
    "content": "Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications.",
    "sectionIds": [1, 3],
    "userId": 1,
    "imagesUrl": ["http://example.com/spring1.jpg"],
    "duracion": "10 min read"
}
```

### Create Blog
**POST** `/api/blogs`

#### Request
```json
{
    "title": "Understanding REST APIs",
    "content": "Learn how to design and implement RESTful web services.",
    "sectionIds": [1, 2],
    "userId": 1,
    "imagesUrl": ["http://example.com/rest1.jpg", "http://example.com/rest2.jpg"],
    "duracion": "8 min read"
}
```

#### Response (200 OK)
```json
{
    "id": 3,
    "title": "Understanding REST APIs",
    "content": "Learn how to design and implement RESTful web services.",
    "sectionIds": [1, 2],
    "userId": 1,
    "imagesUrl": ["http://example.com/rest1.jpg", "http://example.com/rest2.jpg"],
    "duracion": "8 min read"
}
```

### Update Blog
**PUT** `/api/blogs/{id}`

#### Request
```json
{
    "title": "Updated Blog Title",
    "content": "Updated blog content",
    "sectionIds": [3],
    "userId": 1,
    "imagesUrl": ["http://example.com/updated-image.jpg"],
    "duracion": "12 min read"
}
```

#### Response (200 OK)
```json
{
    "id": 1,
    "title": "Updated Blog Title",
    "content": "Updated blog content",
    "sectionIds": [3],
    "userId": 1,
    "imagesUrl": ["http://example.com/updated-image.jpg"],
    "duracion": "12 min read"
}
```

### Delete Blog
**DELETE** `/api/blogs/{id}`

#### Response (204 No Content)
*(No response body)*

### Get Sections for a Blog
**GET** `/api/blogs/{id}/sections`

#### Response (200 OK)
```json
[
    {
        "id": 1,
        "name": "Technology",
        "description": "Articles about technology and innovation",
        "blogIds": [1, 2],
        "imagesUrl": []
    },
    {
        "id": 2,
        "name": "Science",
        "description": "Scientific discoveries and research",
        "blogIds": [1],
        "imagesUrl": ["http://example.com/science1.jpg"]
    }
]
```

## Image Upload

### Upload Image
**POST** `/api/images/upload`

#### Request (multipart/form-data)
- File: [image file to upload]

#### Response (200 OK)
```json
{
    "fileName": "uploaded-image.jpg",
    "filePath": "/Users/username/uploads/uploaded-image.jpg",
    "downloadUrl": "/api/images/download/uploaded-image.jpg"
}
```

### Download Image
**GET** `/api/images/download/{filename}`

#### Response (200 OK)
Returns the image file with appropriate Content-Type header

## Visit Tracking

### Record Visit
**POST** `/api/visits`

#### Request
```json
{
    "blogId": 1,
    "visitorIp": "192.168.1.100"
}
```

#### Response (200 OK)
*(No response body - empty response with 200 status)*

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "timestamp": "2026-06-07T21:19:56.123+00:00",
    "status": 400,
    "error": "Bad Request",
    "message": "Validation failed",
    "path": "/api/blogs"
}
```

### 401 Unauthorized
```json
{
    "timestamp": "2026-06-07T21:19:56.123+00:00",
    "status": 401,
    "error": "Unauthorized",
    "message": "Full authentication is required to access this resource",
    "path": "/api/blogs"
}
```

### 403 Forbidden
```json
{
    "timestamp": "2026-06-07T21:19:56.123+00:00",
    "status": 403,
    "error": "Forbidden",
    "message": "Access is denied",
    "path": "/api/blogs"
}
```

### 404 Not Found
```json
{
    "timestamp": "2026-06-07T21:19:56.123+00:00",
    "status": 404,
    "error": "Not Found",
    "message": "Resource not found",
    "path": "/api/blogs/999"
}
```

### 500 Internal Server Error
```json
{
    "timestamp": "2026-06-07T21:19:56.123+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "message": "An unexpected error occurred",
    "path": "/api/blogs"
}
```