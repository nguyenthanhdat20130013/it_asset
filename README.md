# IT Asset Management System

## Introduction
The IT Asset Management System is a comprehensive web application designed to help organizations track and manage their hardware and software assets. It provides a centralized dashboard for monitoring assets, employees, companies, departments, SIM cards, and more. The system ensures efficient allocation, tracking, and maintenance of IT resources.

## Use Cases
- **Asset Tracking**: Register and monitor the lifecycle of hardware assets (Laptops, Desktops, Monitors, etc.).
- **Employee Management**: Manage employee details and assign assets to them.
- **SIM Card Management**: Track SIM cards, their assignment, and expiration dates.
- **Organization Structure**: Manage multiple companies and departments within the system.
- **Software Inventory**: Keep track of software licenses and installations.
- **Project Management**: Organize assets and resources by projects.
- **Reporting**: Visualize data through a dashboard with key metrics and charts.

## Variable Specifications
The application uses environment variables for configuration. Create a `.env` file in the `server` directory with the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Connection string for the MySQL database (Prisma format). | `mysql://root:password@localhost:3306/db_name` |
| `PORT` | The port number on which the server will run. | `3000` |
| `JWT_SECRET` | A secret key used for signing JSON Web Tokens for authentication. | `your_very_strong_secret_key` |

## Project Documentation

### Architecture
The project follows a standard Client-Server architecture:
- **Client**: A React-based Single Page Application (SPA) built with Vite. It interacts with the backend via RESTful APIs.
- **Server**: A Node.js/Express application that handles API requests, authentication, and database interactions using Prisma ORM.
- **Database**: MySQL relational database for storing application data.

### Technology Stack
- **Frontend**: React, Vite, Ant Design (UI Library), TaiwindCSS (Styling), Axios (API Client), React Router.
- **Backend**: Node.js, Express, Prisma ORM.
- **Database**: MySQL.
- **Tools**: Docker (for containerization), ESLint (Linting).

### Folder Structure
```
d:/code/newproject/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Contexts (e.g., AuthContext)
│   │   ├── pages/          # Application pages/routes
│   │   └── ...
├── server/                 # Backend Node.js Application
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware (Auth, etc.)
│   │   ├── models/         # (Prisma handles models, but folder might exist for custom logic)
│   │   ├── routes/         # API Route definitions
│   │   └── index.js        # Server entry point
│   └── prisma/             # Prisma schema and migrations
└── README.md               # This documentation
```

## How to Run

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server
- NPM or Yarn

### 1. Database Setup
Ensure your MySQL server is running and you have created a database (e.g., `it_asset_management`). Update the `DATABASE_URL` in `server/.env`.

Run Prisma migrations to create tables:
```bash
cd server
npx prisma migrate dev
```

### 2. Start the Server
```bash
cd server
npm install
npm start
```
The server will start on `http://localhost:3000` (or specified PORT).

### 3. Start the Client
```bash
cd client
npm install
npm run dev
```
The client will start, typically on `http://localhost:5173`. Access the application in your browser.

## Code Overview
- **Backend**: The `server/src/index.js` initializes the Express app. Routes are defined in `server/src/routes` and mapped to controllers in `server/src/controllers`. Authentication is handled via middleware using JWT.
- **Frontend**: `client/src/App.jsx` handles the routing. `AuthContext` manages the user session. Pages fetch data from the backend using standard API calls.
