# Learning Portal

This repository contains a simple learning portal application built with ReactJS for the frontend and Spring Boot for the backend.

## Project Structure

- `backend/` - Spring Boot REST API using Java 25, Spring Boot 3.2.4, H2 database, Spring Security, and JWT authentication.
- `frontend/` - React application created with Create React App, using React Router and Axios.

## Prerequisites

- Java 22+ installed
- Maven installed or use the provided backend `run-backend.bat`
- Node.js 24+ installed
- npm installed

## Local Setup

### Backend

```powershell
cd backend
./run-backend.bat
```

### Frontend

```powershell
cd frontend
npm install
npm start
```

The frontend proxies API calls to `http://localhost:8080`.

## Available Scripts

### Frontend

- `npm start` - Run the React development server
- `npm run build` - Build the React production bundle
- `npm test` - Run frontend tests (if configured)

### Backend

- `mvn spring-boot:run` - Start the Spring Boot backend

## Notes

- The application uses H2 in-memory database for development.
- A local `run-backend.bat` script is included to set `JAVA_HOME` and Maven if installed in the user folder.
