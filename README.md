# WalkOnSongs - User Registration & Authentication System

A full-stack web application with user registration, email verification, and authentication built with Angular, Node.js, Express, and MySQL.

## Features

- ✅ User registration with form validation
- ✅ Email verification system
- ✅ Secure login with JWT authentication
- ✅ Password requirements (6+ chars, uppercase, lowercase, special character)
- ✅ Responsive design with Tailwind CSS
- ✅ Protected routes with authentication guards

## Tech Stack

### Frontend
- **Angular 17** (Standalone components)
- **Tailwind CSS** for styling
- **Reactive Forms** for form validation
- **HTTP Client** for API communication

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **JWT** for authentication
- **Nodemailer** for email verification
- **bcryptjs** for password hashing

## Project Structure

```
playground/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and email configuration
│   ├── middleware/         # Authentication middleware
│   ├── routes/            # API routes
│   ├── .env               # Environment variables
│   ├── package.json       # Backend dependencies
│   └── server.js          # Express server
├── frontend/              # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── services/      # Authentication service
│   │   │   ├── guards/        # Route guards
│   │   │   └── interceptors/  # HTTP interceptors
│   │   └── styles.css         # Tailwind CSS
│   └── package.json           # Frontend dependencies
├── database/              # Database schema
│   └── users_table.sql    # Users table creation script
└── CLAUDE.md              # Project memory/configuration
```

## Setup Instructions

### 1. Database Setup

1. Create MySQL database named `walkonsongs`
2. Run the SQL script to create the users table:
   ```sql
   mysql -u root -p walkonsongs < database/users_table.sql
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=walkonsongs
   JWT_SECRET=your-super-secret-jwt-key
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER_NAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   
   EMAIL_FROM_EMAIL=your-email@gmail.com
   EMAIL_FROM=WalkOnSongs
   CLIENT_URL=http://localhost:4200
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Angular development server:
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:4200`

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - User registration
- `POST /login` - User login
- `GET /verify-email?token=<token>` - Email verification

### Health Check

- `GET /api/health` - API health check

## Usage Flow

1. **Registration**: User fills out registration form with first name, last name, email, and password
2. **Email Verification**: System sends verification email with unique token
3. **Email Confirmation**: User clicks verification link to activate account
4. **Login**: User can login with verified email and password
5. **Welcome Page**: Authenticated users see personalized welcome page

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one special character

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | 127.0.0.1 |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | password123 |
| `DB_NAME` | Database name | walkonsongs |
| `JWT_SECRET` | JWT signing secret | your-secret-key |
| `SMTP_HOST` | Email server host | smtp.gmail.com |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USER_NAME` | Email username | user@gmail.com |
| `SMTP_PASSWORD` | Email password/app password | app-password |
| `EMAIL_FROM_EMAIL` | Sender email | noreply@yourapp.com |
| `EMAIL_FROM` | Sender display name | WalkOnSongs |
| `CLIENT_URL` | Frontend URL | http://localhost:4200 |

## Development Notes

- Frontend uses Angular standalone components
- Backend implements proper error handling and validation
- Database uses proper indexing for performance
- Passwords are hashed using bcryptjs with salt rounds
- JWT tokens expire after 24 hours
- Email verification tokens expire after 24 hours
- All forms include client-side and server-side validation