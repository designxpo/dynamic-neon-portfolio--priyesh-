# Portfolio Backend API

Backend API for handling contact form submissions and admin panel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Choose a database option:
  - Option A: MongoDB Atlas (recommended for production)
  - Option B: Local MongoDB (installed on your machine)
  - Option C: In-memory MongoDB (zero-install for development)

3. If using Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

4. Create `.env` file in the backend directory (copy `.env.example`):
```env
# Option A (Atlas):
# MONGODB_URI=your_mongodb_atlas_connection_string

# Option B (Local):
# MONGODB_URI=mongodb://127.0.0.1:27017/portfolio

# Option C (In-memory for dev):
# MONGODB_USE_MEMORY=true

# API Port
PORT=5000
```

5. Start the server:
```bash
npm run dev  # for development with nodemon
npm start    # for production
```

Tip: From the project root, you can run both frontend and backend together:
```bash
npm run dev:all
```

## API Endpoints

### POST /api/contacts
Submit a contact form.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "contactNumber": "+1234567890",
  "message": "Hello, I want to work with you!"
}
```

**Response:**
```json
{
  "message": "Contact form submitted successfully",
  "contact": { ... }
}
```

### GET /api/contacts
Get all contact submissions (for admin panel).

**Response:**
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1234567890",
    "message": "Hello...",
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}


## Notes

- If `MONGODB_URI` is not set, the server will log a warning and can fall back to an in-memory MongoDB instance when `MONGODB_USE_MEMORY=true` is defined. This is convenient for local development and testing without installing MongoDB.
- In-memory mode does not persist data between restarts.
