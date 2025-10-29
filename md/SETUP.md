# 🚀 Quick Setup Guide

## Backend Setup (5 minutes)

### Step 1: Install Dependencies
```powershell
cd backend
npm install
```

### Step 2: Setup Environment
```powershell
# Copy example env file
copy .env.example .env
```

Edit `.env` file with your settings:
- MongoDB connection string
- Email credentials (Gmail App Password recommended)
- JWT secrets

### Step 3: Start MongoDB
Make sure MongoDB is running:
```powershell
# If using local MongoDB
mongod

# OR use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

### Step 4: Run Backend
```powershell
npm run dev
```

Backend will start on http://localhost:3000

## Frontend Setup (Coming Soon)

The Angular frontend will be created next with:
- Angular Material UI
- Stunning responsive design
- Theme management system
- All feature modules

## Testing the Backend

### 1. Test Health Check
```powershell
curl http://localhost:3000/health
```

### 2. Create a Tenant (First Time Setup)
You'll need to create a tenant first. Use a tool like Postman or Thunder Client:

```http
POST http://localhost:3000/api/tenants
Content-Type: application/json

{
  "name": "My Company",
  "domain": "mycompany",
  "contactInfo": {
    "email": "admin@mycompany.com"
  }
}
```

### 3. Register First User
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "tenantId": "<tenant_id_from_step_2>",
  "email": "admin@mycompany.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

### 4. Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mycompany.com",
  "password": "Admin@123",
  "tenantId": "<tenant_id>"
}
```

You'll receive an accessToken - use this in the Authorization header for protected routes:
```
Authorization: Bearer <your_access_token>
```

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Timesheets
- `GET /api/timesheets` - Get timesheets
- `POST /api/timesheets` - Create timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `POST /api/timesheets/:id/submit` - Submit timesheet
- `POST /api/timesheets/:id/approve` - Approve timesheet

### Documents
- `GET /api/documents` - Get documents
- `POST /api/documents` - Upload document
- `POST /api/documents/:id/sign` - Sign document
- `GET /api/documents/:id/download` - Download document

### Leaves
- `GET /api/leaves` - Get leaves
- `POST /api/leaves` - Request leave
- `POST /api/leaves/:id/approve` - Approve leave

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/timesheets` - Timesheet analytics
- `GET /api/analytics/leaves` - Leave analytics

## Email Setup (Gmail)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security > 2-Step Verification > App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
4. Use this password in your `.env` file:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- Try: `mongodb://localhost:27017/emp-portal`

### Email Not Sending
- Verify Gmail App Password is correct
- Check EMAIL_* settings in .env
- Make sure 2FA is enabled on Gmail

### Port Already in Use
Change PORT in .env file:
```
PORT=3001
```

## Next Steps

1. ✅ Backend API is ready
2. 🚧 Angular Frontend (Coming next)
3. 🚧 Complete all controllers
4. 🚧 Add file upload for documents
5. 🚧 Implement e-signature feature
6. 🚧 Add analytics dashboard
7. 🚧 Deploy to production

## Development

### Watch Mode
```powershell
npm run dev
```

### Build
```powershell
npm run build
```

### Production
```powershell
npm start
```

## Architecture

This is a **multi-tenant** application where:
- Each organization (tenant) has its own isolated data
- Users belong to a specific tenant
- All data queries are automatically scoped to the tenant
- Each tenant can have custom branding and settings

## Security Features

- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Rate Limiting
- ✅ CORS Protection
- ✅ Security Headers (Helmet)
- ✅ Session Management
- ✅ OTP-based Password Reset
- ✅ Role-Based Access Control

Ready to build the frontend! 🎨
