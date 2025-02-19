
---

# AITUwka

AITUwka is a social platform created for **Astana IT University** students. It extends a previous front-end project from the Web Technologies-1 course by adding a Node.js/Express and MongoDB **backend**. It offers features like posting content, creating groups, marketplace interactions, and more, providing a vibrant and interactive online community for students.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Project Overview](#project-overview)
  - [Key Features and Pages](#key-features-and-pages)
- [API Documentation](#api-documentation)
- [Team](#team)

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zikaal/AITUwka2.0.git
   cd AITUwka2.0
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root with the following variables:
   ```bash
   MONGO_URI=mongodb://localhost:27017/aituwka
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   By default, the server runs at `http://localhost:3000`.

---

## Project Overview

The project is split into the following main modules:

- **models/** — contains the Mongoose models for `User`, `Post`, and `Comment`.
- **controllers/** — contains the business logic (creating posts, registration, login, etc.).
- **routes/** — contains the route files (endpoints) for different entities (`authRoutes`, `userRoutes`, `postRoutes`, `commentRoutes`).
- **middlewares/** — contains middleware, for example `authMiddleware` for JWT verification.
- **validations/** — contains Joi schemas for validation (`schemas.js`).
- **config/** — holds the database connection settings (`db.js`).
- **public/** — folder with static files (HTML, CSS, JS for the frontend).

**Key features**:
- Registration and login (with JWT).
- Creating, editing, and deleting posts.
- Adding comments to posts, editing and deleting comments.
- User roles (`user` and `admin`): admin can edit/delete any posts and comments, while a user can only manage their own.
- Searching posts by `username`.

---

## API Documentation

All routes are prefixed with **`/api`**. Below is a summary of the main endpoints:

### 1. Authentication (`/api/auth`)

| Method | Endpoint          | Description                                        | Request Body / Headers                                                            | Response                                                                                 |
|-------:|-------------------|----------------------------------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| **POST** | `/api/auth/register` | Register a new user                              | `{ "username": "John", "email": "john@example.com", "password": "secret" }`        | **201 Created** with `{ id, username, email }` or **400** if validation fails.           |
| **POST** | `/api/auth/login`    | Log in a user                                    | `{ "email": "john@example.com", "password": "secret" }`                            | **200 OK** with `{ token, role, id }` or **400** if invalid credentials.                 |
| **GET**  | `/api/auth/profile`  | Get the current user's profile (requires token)  | **Header**: `Authorization: Bearer <token>`                                        | **200 OK** with `{ username, email, role }` or **401/403** if token is missing/invalid.  |

### 2. Users (`/api/users`)

| Method | Endpoint           | Description                                                         | Request Body / Headers                                        | Response                                                                                      |
|-------:|--------------------|---------------------------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| **GET** | `/api/users`      | Get a list of users (requires token)                                | **Header**: `Authorization: Bearer <token>`                   | **200 OK** with an array of users, or **401/403** if token is missing/invalid.                |
| **PUT** | `/api/users/:id`  | Update user profile (only owner or admin)                           | **Header**: `Authorization: Bearer <token>` <br> `{ username?, email?, password? }` | **200 OK** with updated user data, **403** if unauthorized, **404** if user not found.        |

### 3. Posts (`/api/posts`)

| Method   | Endpoint               | Description                                                        | Request Body / Headers                                                          | Response                                                                                                  |
|---------:|------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| **POST** | `/api/posts`          | Create a new post (requires token)                                 | **Header**: `Authorization: Bearer <token>` <br> `{ "title": "...", "content": "..." }` | **201 Created** with the created post object, or **400** if validation fails.                             |
| **GET**  | `/api/posts`          | Get all posts with author info                                     | —                                                                               | **200 OK** with an array of posts (each post includes `owner`).                                          |
| **GET**  | `/api/posts/search`   | Search posts by username                                           | Query param: `?username=Alex`                                                  | **200 OK** with an array of posts belonging to that user, or empty array if none found.                   |
| **PUT**  | `/api/posts/:id`      | Update a post (only owner or admin)                                | **Header**: `Authorization: Bearer <token>` <br> `{ title?, content? }`        | **200 OK** with `{ message: 'Post updated successfully.' }`, or **403** if unauthorized, **404** if not found. |
| **DELETE** | `/api/posts/:id`    | Delete a post (only owner or admin)                                | **Header**: `Authorization: Bearer <token>`                                     | **200 OK** with `{ message: 'Post deleted successfully.' }`, or **403** if unauthorized, **404** if not found. |

### 4. Comments (`/api/posts/:id/comments`)

| Method   | Endpoint                                        | Description                                                          | Request Body / Headers                                                  | Response                                                                                                                           |
|---------:|-------------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| **POST** | `/api/posts/:id/comments`                       | Add a comment to a post (requires token)                             | **Header**: `Authorization: Bearer <token>` <br> `{ "text": "..." }`     | **201 Created** with the created comment, or **404** if post not found, or **400** if validation fails.                            |
| **GET**  | `/api/posts/:id/comments`                       | Get comments for a post                                             | —                                                                        | **200 OK** with an array of comments, each containing `owner`.                                                                     |
| **PUT**  | `/api/posts/:postId/comments/:commentId`         | Update a comment (only comment owner or admin)                       | **Header**: `Authorization: Bearer <token>` <br> `{ "text": "..." }`     | **200 OK** with `{ message: 'Comment updated successfully.', comment }`, or **403** if unauthorized, **404** if not found.         |
| **DELETE** | `/api/posts/:postId/comments/:commentId`       | Delete a comment (only comment owner or admin)                       | **Header**: `Authorization: Bearer <token>`                               | **200 OK** with `{ message: 'Comment deleted successfully.' }`, or **403** if unauthorized, **404** if not found.                  |

---

## Team

This project was created for **Astana IT University** by:
- **Zinetov Alikhan**
- **Daniyal Assanov**
- **Alexandr Chshudro**

It is a continuation of the previous **Web Technologies-1 (Front-end)** course project, now enhanced with a Node.js/Express backend.

**Enjoy using AITUwka!**
