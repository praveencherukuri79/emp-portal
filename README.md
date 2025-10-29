# Employee & Employer Portal - Multi-Tenant Application

A comprehensive, feature-rich employee and employer management portal built with **Angular**, **Node.js**, **TypeScript**, **Express.js**, and **MongoDB**. This application supports multi-tenancy, allowing multiple organizations to use the platform with complete data isolation.

## 🌟 Features

### Core Features
- ✅ **Multi-Tenant Architecture** - Complete data isolation for each organization
- ✅ **Authentication & Authorization** - JWT-based auth with refresh tokens
- ✅ **Session Management** - Express session with MongoDB store
- ✅ **Password Reset** - OTP-based password reset via email
- ✅ **Email Notifications** - Nodemailer integration for all notifications

### Employee Management
- 👥 User Management (CRUD operations)
- 📊 Role-based Access Control (Super Admin, Admin, Employer, Employee)
- 📝 Employee Profiles with visa information
- 🔐 Document Security & Access Control

### Timesheet Management
- ⏰ Time Entry & Tracking
- 📅 Daily, Weekly, Monthly Views
- ✅ Approval Workflow
- 📊 Billable/Non-billable Hours
- 📈 Reporting & Analytics

### Document Management
- 📄 Upload & Store Documents (Visa, Contracts, Certifications, etc.)
- 🏷️ Categorization & Tagging
- 📅 Expiry Date Tracking
- ✍️ **E-Signature Integration** - Sign documents online
- 🔒 Secure Access Control
- 🔗 Document Sharing

### Leave Management
- 🌴 Leave Requests (Annual, Sick, Personal, etc.)
- ✅ Approval Workflow
- 📊 Leave Balance Tracking
- 📅 Calendar Integration

### Additional Features
- 🔔 Real-time Notifications
- 📧 Email Notifications
- 📊 Analytics & Reporting Dashboard
- 🎨 Tenant-specific Branding & Themes
- 📱 Responsive Design (Mobile & Tablet Compatible)
- 🌓 Theme Management (Light/Dark/Corporate modes)

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** - Server framework
- **TypeScript** - Type-safe development
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **Express Session** - Session management

### Frontend
- **Angular 17+** - Frontend framework
- **Angular Material** - UI components
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe development
- **SCSS** - Styling

## 📁 Project Structure

```
emp-portal/                          # 🏠 Root directory
├── package.json                     # 📦 Unified package management
├── .env.example                     # ⚙️ Environment configuration template
├── .gitignore                       # 🚫 Git ignore rules
├── README.md                        # 📖 Project documentation
│
├── md/                              # 📚 Documentation files
│   ├── API_REFERENCE.md
│   ├── DEPLOYMENT.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── PROJECT_STATUS.md
│   ├── SETUP.md
│   └── SUCCESS_SUMMARY.md
│
├── scripts/                         # 🔧 Setup and utility scripts
│   ├── setup.bat                    # Windows setup script
│   └── setup.sh                     # Linux/Mac setup script
│
├── backend/                         # 🖥️ Express.js API server
│   ├── src/
│   │   ├── controllers/             # 🎮 Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── timesheet.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── leave.controller.ts
│   │   │   ├── tenant.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── models/                  # 🗄️ Database models
│   │   │   ├── tenant.model.ts
│   │   │   ├── user.model.ts
│   │   │   ├── timesheet.model.ts
│   │   │   ├── document.model.ts
│   │   │   ├── leave.model.ts
│   │   │   └── notification.model.ts
│   │   ├── routes/                  # 🛣️ API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── timesheet.routes.ts
│   │   │   ├── document.routes.ts
│   │   │   ├── leave.routes.ts
│   │   │   ├── tenant.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── middlewares/             # 🛡️ Custom middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── rate-limiter.middleware.ts
│   │   ├── utils/                   # 🔧 Utility functions
│   │   │   ├── jwt.util.ts
│   │   │   └── email.util.ts
│   │   └── server.ts                # 🚀 Entry point
│   ├── package.json                 # 📦 Backend dependencies
│   └── tsconfig.json                # ⚙️ TypeScript configuration
│
└── frontend/                        # 🎨 Angular web application
    ├── src/
    │   ├── app/
    │   │   ├── core/                # 🔐 Core services & guards
    │   │   │   ├── guards/          # 🛡️ Route guards
    │   │   │   ├── services/        # 🔧 Core services
    │   │   │   └── interceptors/    # 🔄 HTTP interceptors
    │   │   ├── shared/              # 🤝 Shared components & modules
    │   │   └── features/            # 📱 Feature modules
    │   │       ├── auth/            # 🔐 Authentication
    │   │       ├── dashboard/       # 📊 Main dashboard
    │   │       ├── timesheets/      # ⏰ Time tracking
    │   │       ├── documents/       # 📄 Document management
    │   │       ├── leaves/          # 🌴 Leave management
    │   │       ├── users/           # 👥 User management
    │   │       └── settings/        # ⚙️ Application settings
    │   ├── assets/                  # 🖼️ Static assets
    │   ├── environments/            # 🌍 Environment configurations
    │   ├── styles.scss              # 🎨 Global styles
    │   ├── index.html               # 📄 Main HTML file
    │   └── main.ts                  # 🚀 Angular bootstrap
    ├── angular.json                 # ⚙️ Angular CLI configuration
    ├── package.json                 # 📦 Frontend dependencies
    └── tsconfig.json                # ⚙️ TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (v6+ recommended)
- npm (v9+ recommended)

### Quick Start (Unified Setup)

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd emp-portal
   ```

2. **Run setup script:**
   ```bash
   # On Windows
   scripts\setup.bat
   
   # On Linux/Mac
   ./scripts/setup.sh
   ```

3. **Configure environment:**
   ```bash
   # Copy and edit environment variables
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

4. **Start development servers:**
   ```bash
   # 🔄 RECOMMENDED: Watch mode (auto-restart on file changes)
   npm run watch
   
   # 🚀 Alternative: Standard development mode
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Angular dev server on port 4200
   npm run dev:backend   # Express server on port 3000
   ```

### Manual Setup

1. **Install all dependencies:**
   ```bash
   npm install  # Installs both frontend and backend dependencies
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   BACKEND_PORT=3000
   FRONTEND_PORT=4200
   
   MONGODB_URI=mongodb://localhost:27017/emp-portal
   
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=24h
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-in-production
   JWT_REFRESH_EXPIRE=7d
   
   SESSION_SECRET=your-session-secret-change-in-production
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

3. **Start MongoDB:**
   ```bash
   # If using MongoDB locally
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env with your Atlas connection string
   ```

4. **Run development servers:**
   ```bash
   npm run dev  # Starts both frontend (port 4200) and backend (port 3000)
   ```

### Available Scripts

```bash
# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start only Angular dev server (port 4200)
npm run dev:backend         # Start only Express server (port 3000)

# Building
npm run build              # Build both frontend and backend for production
npm run build:frontend     # Build only frontend
npm run build:backend      # Build only backend

# Testing
npm test                   # Run all tests
npm run test:frontend      # Run Angular tests
npm run test:backend       # Run backend tests

# Production
npm start                  # Start production backend server
npm run start:frontend     # Start frontend in production mode

# Utilities
npm run clean             # Clean build directories
npm run lint              # Lint all code
   ```bash
   ng serve
   ```

   The frontend will run on `http://localhost:4200`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "tenantId": "tenant_id",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "tenantId": "tenant_id"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com",
  "tenantId": "tenant_id"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "tenantId": "tenant_id",
  "otp": "123456"
}
```

### Timesheet Endpoints
```http
GET    /api/timesheets           # Get all timesheets
POST   /api/timesheets           # Create timesheet
GET    /api/timesheets/:id       # Get timesheet by ID
PUT    /api/timesheets/:id       # Update timesheet
DELETE /api/timesheets/:id       # Delete timesheet
POST   /api/timesheets/:id/submit   # Submit for approval
POST   /api/timesheets/:id/approve  # Approve timesheet
POST   /api/timesheets/:id/reject   # Reject timesheet
```

### Document Endpoints
```http
GET    /api/documents            # Get all documents
POST   /api/documents            # Upload document
GET    /api/documents/:id        # Get document by ID
DELETE /api/documents/:id        # Delete document
POST   /api/documents/:id/sign   # Sign document
GET    /api/documents/:id/download # Download document
```

### Leave Endpoints
```http
GET    /api/leaves               # Get all leaves
POST   /api/leaves               # Request leave
GET    /api/leaves/:id           # Get leave by ID
PUT    /api/leaves/:id           # Update leave
DELETE /api/leaves/:id           # Cancel leave
POST   /api/leaves/:id/approve   # Approve leave
POST   /api/leaves/:id/reject    # Reject leave
```

## 🎨 Theme System

The application includes a sophisticated theme system inspired by the portfolio reference:

### Theme Options
- **Light Mode** - Clean, bright interface
- **Dark Mode** - Eye-friendly dark interface  
- **Corporate Mode** - Professional business theme

### Color Customization
Each tenant can customize:
- Primary Color
- Secondary Color
- Accent Color
- Logo & Branding

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- CORS protection
- Helmet.js security headers
- Session management
- Multi-tenant data isolation
- Role-based access control

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access, manage all tenants |
| **Admin** | Manage tenant settings, all CRUD operations |
| **Employer** | Manage employees, approve timesheets/leaves |
| **Employee** | Manage own data, submit timesheets/leaves |

## 📧 Email Templates

The system includes beautiful, responsive email templates for:
- Welcome emails
- OTP/Password reset
- Timesheet approvals
- Leave approvals
- Document notifications
- General notifications

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Deploy using Git or container
3. Set MongoDB connection string

### Frontend Deployment (Vercel/Netlify)

1. Build the application:
   ```bash
   ng build --configuration production
   ```
2. Deploy the `dist/` folder

## 📝 Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow Angular style guide
- Use meaningful variable names
- Add comments for complex logic
- Write reusable components

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
# Make changes
git commit -m "feat: add feature description"
git push origin feature/feature-name
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
ng test
```

## 📚 Documentation

For detailed information about the project, please refer to the documentation files in the `md` folder:

- **[Setup Guide](md/SETUP.md)** - Detailed installation and configuration instructions
- **[Watch Mode Guide](md/WATCH_MODE_GUIDE.md)** - 🔄 Development watch mode and hot reload
- **[Implementation Guide](md/IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation guide
- **[API Reference](md/API_REFERENCE.md)** - Complete API documentation
- **[Deployment Guide](md/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Status](md/PROJECT_STATUS.md)** - Current project status and roadmap
- **[Success Summary](md/SUCCESS_SUMMARY.md)** - Project achievements and milestones

## �📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ for USA employers

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Support

For support, email support@emp-portal.com

---

**Note:** This is a comprehensive enterprise application. Make sure to configure all environment variables and security settings properly before deploying to production.
