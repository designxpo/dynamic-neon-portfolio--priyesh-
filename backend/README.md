# Portfolio Backend API

Backend API for handling contact form submissions and admin panel.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB Atlas:
   - Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

3. Create `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
```

4. Start the server:
```bash
npm run dev  # for development with nodemon
npm start    # for production
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
