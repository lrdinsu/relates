# Relates

Relates is a full-stack social media application built with `React`, `TypeScript`, `Vite`, `Express`, and `PostgreSQL`. It leverages `Docker` for containerization and `Nginx` as a reverse proxy. The application provides a modern user interface, real-time features, and robust authentication.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Client](#client)
  - [Technologies](#technologies)
  - [Features](#features-1)
- [Server](#server)
  - [Technologies](#technologies-1)
  - [Features](#features-2)
- [Packages](#packages)
  - [Validation](#validation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Development](#development)
- [License](#license)

## Features

- **User Authentication**: Secure login and registration using JWT.
- **Posts and Comments**: Create, view, like, comment, and repost posts.
- **Real-time Updates**: Real-time updates using React Query.
- **Responsive Design**: Mobile-first approach with responsive components.
- **Dark Mode Support**: Theme toggle between light and dark modes.
- **Profile Management**: User profiles with avatars, bios, and follower counts.
- **Notifications**: In-app notifications for user interactions.
- **Validation**: Shared validation schemas using Zod.

## Project Structure

```
.
├── .dockerignore
├── .env
├── .gitignore
├── .idea/
│   ├── .gitignore
│   ├── cssdialects.xml
│   ├── dataSources/
│   ├── httpRequests/
│   ├── inspectionProfiles/
│   ├── modules.xml
│   ├── relates.iml
│   ├── workspace.xml
├── .prettierrc.json
├── client/
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── features/
│   │   │   ├── posts/
│   │   │   │   ├── components/
│   │   │   │   │   ├── PostItem/
│   │   │   │   │   │   ├── PostItem.tsx
│   │   │   │   │   │   ├── PostItem.module.css
│   │   │   │   │   ├── PostMain/
│   │   │   │   │   │   ├── PostMain.tsx
│   │   │   │   │   │   ├── PostMain.module.css
│   │   │   ├── comments/
│   │   │   │   ├── AddComment/
│   │   │   │   │   ├── AddComment.module.css
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
├── docker-compose.yaml
├── Dockerfile
├── LICENSE
├── nginx.conf
├── package.json
├── packages/
│   ├── validation/
│   │   ├── src/
│   │   │   ├── schemas.ts
│   │   ├── eslint.config.js
│   │   ├── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   │   ├── 20241119013655_update_repost_model/
│   │   │   │   ├── migration.sql
│   │   ├── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── postControllers/
│   │   │   │   ├── updatePostController.ts
│   │   ├── test/
│   │   │   ├── auth/
│   │   │   │   ├── signup.http
│   │   │   ├── posts/
│   │   │   │   ├── createPost.http
│   │   │   │   ├── updatePost.http
│   ├── eslint.config.js
│   ├── tsconfig.json
└── README.md
```

## Client

The client is a React application using Vite for bundling and development. It is located in the `client/` directory.

### Technologies

- **React 18**
- **TypeScript**
- **Vite**
- **Mantine UI Library**
- **React Router**
- **React Query**
- **Zustand** for state management
- **Axios** for API requests

### Features

- **Modern UI Components**: Built with Mantine UI for a sleek design.
- **State Management**: Uses Zustand for global state management.
- **API Handling**: Axios instance configured with interceptors.
- **Routing**: React Router setup with code-splitting and lazy loading.
- **Forms and Validation**: Form handling with React Hook Form and Zod schemas.
- **Custom Hooks**: Reusable hooks for authentication and data fetching.
- **Responsive Layouts**: Components like `Header`, `Navbar`, and `Footer` adapting to screen sizes.
- **Post Components**: Modular components such as `PostItem`, `PostMain`, and `PostActions`.

## Server

The server is an Express application written in TypeScript. It is located in the `server/` directory.

### Technologies

- **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **JWT Authentication**
- **Zod** for validation
- **Cors** and **Helmet** for security

### Features

- **Authentication**: Secure routes with JWT tokens.
- **User Management**: CRUD operations for user profiles.
- **Post Management**: Endpoints for creating, reading, updating, and deleting posts.
- **Comment System**: Nested comments with reply functionality.
- **Reposting**: Ability to repost existing posts.
- **Database ORM**: Prisma for database interactions with PostgreSQL.
- **Input Validation**: Zod schemas for request validation.
- **Error Handling**: Centralized error handling middleware.
- **Testing**: HTTP tests using *.http* files.

## Packages

### Validation

Located in `packages/validation/`, this package contains shared Zod schemas and types used both in the client and server for consistent validation.

- **User Schemas**: Validation for user registration, login, and profile updates.
- **Post Schemas**: Validation for creating and updating posts.
- **Comment Schemas**: Validation for comments and replies.
- **Repost Schemas**: Validation for reposting functionality.

## Getting Started

### Prerequisites

- **Node.js**
- **pnpm**: Preferred package manager.
- **Docker**
- **Docker Compose**

### Installation

1. **Clone the repository**:

    ```
    git clone `repository-url`
    cd relates
    ```

2. **Install dependencies**:

    ```
    pnpm install
    ```

3. **Environment Variables**:

    - Create a `.env` file in the root directory and add the necessary environment variables.
    - Sample `.env` files might be provided in the `client/` and `server/` directories.

### Running the Application

1. **Build and start the Docker containers**:

    ```
    docker-compose up --build
    ```

2. **Access the application**:

    - Client: `http://localhost:8080`
    - Server: `http://localhost:3000`

### Development

To run the client and server in development mode without Docker:

1. **Start the client**:

    ```
    cd client
    pnpm dev
    ```

2. **Start the server**:

    ```
    cd server
    pnpm dev
    ```

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.