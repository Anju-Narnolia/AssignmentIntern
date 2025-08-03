# Wellness Session Platform

A full-stack application for creating and managing wellness sessions with authentication, auto-save functionality, and draft management.

## Features

- ✅ User authentication (register/login) with JWT
- ✅ Secure password hashing with bcrypt
- ✅ Create and edit wellness sessions
- ✅ Auto-save drafts every 5 seconds
- ✅ Publish sessions to public view
- ✅ Responsive UI with Tailwind CSS
- ✅ Protected routes
- ✅ Session management (draft/published)

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS enabled

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- React Hot Toast for notifications
- Tailwind CSS for styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/wellness-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
Get current user (requires authentication)

### Session Endpoints

#### GET /api/sessions
Get all published sessions (public)

#### GET /api/sessions/my-sessions
Get user's own sessions (requires authentication)

#### GET /api/sessions/my-sessions/:id
Get a specific user session (requires authentication)

#### POST /api/sessions/save-draft
Save or update a draft session (requires authentication)
```json
{
  "title": "Yoga Session",
  "tags": "yoga, meditation, wellness",
  "json_file_url": "https://example.com/session.json",
  "sessionId": "optional-existing-session-id"
}
```

#### POST /api/sessions/publish
Publish a session (requires authentication)
```json
{
  "sessionId": "session-id-to-publish"
}
```

#### DELETE /api/sessions/my-sessions/:id
Delete a session (requires authentication)

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  created_at: Date,
  updated_at: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: User),
  title: String,
  tags: [String],
  json_file_url: String,
  status: "draft" | "published",
  created_at: Date,
  updated_at: Date
}
```

## Features in Detail

### Auto-Save Functionality
- Drafts are automatically saved after 5 seconds of inactivity
- Visual feedback shows when auto-save is active
- Manual save option available

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes redirect to login

### Session Management
- Create sessions with title, tags, and JSON file URL
- Save as draft or publish immediately
- Edit existing sessions
- Delete sessions with confirmation

## Project Structure

```
wellness-platform/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── sessions.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Running the Project

1. Start MongoDB (if using local instance)
2. Start the backend: `cd backend && npm run dev`
3. Start the frontend: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser
5. Register a new account and start creating sessions!

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: JWT token expiration time
- `CORS_ORIGIN`: Frontend URL for CORS

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Error handling middleware

## Future Enhancements

- File upload for JSON files
- Session categories and filtering
- User profiles and avatars
- Session ratings and reviews
- Real-time collaboration
- Mobile app version 