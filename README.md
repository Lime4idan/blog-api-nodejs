<div align="center">

# ✍️ Blog API

Create accounts, publish stories, organize categories, and manage uploaded images through a REST API.

<p>
  <img alt="Node.js" src="https://img.shields.io/badge/Runtime-Node.js-43853D?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/API-Express-303846?style=for-the-badge&logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img alt="Mongoose" src="https://img.shields.io/badge/ODM-Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white">
</p>

A compact backend study covering users, posts, categories, password hashing, and local image uploads.

</div>

---

## Preview

![Example image handled by the Blog API upload route](./images/image-1.jpeg)

The repository includes sample images served by the same static route used for post artwork.

## About the project

Blog API is an academic Node.js backend that models the essential parts of a publishing platform. It stores users, posts, and categories in MongoDB, protects stored passwords with bcrypt, and accepts post images through Multer.

The project is intentionally small, making it useful for studying route organization, Mongoose schemas, CRUD operations, file handling, and the connection between a REST API and MongoDB.

## Features

- User registration and login
- Password hashing with bcrypt
- User profile reading, editing, and deletion
- Post creation, reading, editing, and deletion
- Category creation and listing
- Local image upload with Multer
- Static image delivery through `/images`
- MongoDB persistence with Mongoose timestamps

## Technology

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Framework | Express |
| Database | MongoDB |
| Data modeling | Mongoose |
| Password hashing | bcrypt |
| File uploads | Multer |

## Main routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Validate credentials |
| `GET` | `/api/users/:id` | Read a public user profile |
| `PUT` | `/api/users/:id` | Update an owned account |
| `DELETE` | `/api/users/:id` | Delete an owned account and its posts |
| `POST` | `/api/posts` | Create a post |
| `GET` | `/api/posts/:id` | Read a post |
| `PUT` | `/api/posts/:id` | Update an owned post |
| `DELETE` | `/api/posts/:id` | Delete an owned post |
| `GET` | `/api/categories` | List categories |
| `POST` | `/api/categories` | Create a category |
| `POST` | `/api/upload` | Upload a post image |

## Run locally

### Requirements

- Node.js
- npm or Yarn
- MongoDB

```bash
git clone https://github.com/Lime4idan/blog-api-nodejs.git
cd blog-api-nodejs
npm install
```

Create a `.env` file:

```env
MONGO_URL=mongodb://127.0.0.1:27017/blog
```

Start the development server:

```bash
npm start
```

The API runs at `http://localhost:5001`.

## Project structure

```text
blog-api-nodejs/
├── images/       # uploaded and sample post images
├── models/       # Mongoose schemas
├── routes/       # authentication, users, posts, and categories
├── index.js      # Express setup, MongoDB connection, and upload route
└── package.json
```

## Project status

**Status:** Academic backend prototype  
**Focus:** Express routing, MongoDB data modeling, CRUD operations, and file uploads

> This repository is a learning project. Before production use, add token-based authentication, stricter upload validation, centralized error handling, and automated tests.

---

<div align="center">

### ✍️ A small API for stories that deserve their own space.

</div>
