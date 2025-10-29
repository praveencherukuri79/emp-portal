# 🚀 API Quick Reference - Postman Collection

## Base URL
```
http://localhost:3000
```

## 1. Health Check
```http
GET /health
```

## 2. Authentication Flow

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "tenantId": "{{tenantId}}",
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "tenantId": "{{tenantId}}"
}

Response:
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...},
  "tenant": {...}
}
```

### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "{{refreshToken}}"
}
```

### Forgot Password (Request OTP)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com",
  "tenantId": "{{tenantId}}"
}
```

### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "tenantId": "{{tenantId}}",
  "otp": "123456"
}

Response:
{
  "resetToken": "..."
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "tenantId": "{{tenantId}}",
  "newPassword": "NewPassword123!",
  "resetToken": "{{resetToken}}"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {{accessToken}}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {{accessToken}}
```

## 3. Tenants (Super Admin Only)

### Create Tenant
```http
POST /api/tenants
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Acme Corporation",
  "domain": "acme",
  "primaryColor": "#1976d2",
  "secondaryColor": "#dc004e",
  "accentColor": "#9c27b0",
  "contactInfo": {
    "email": "admin@acme.com",
    "phone": "+1-555-0100",
    "address": "123 Main St, NY"
  },
  "subscription": {
    "plan": "professional",
    "maxUsers": 100
  }
}
```

### Get All Tenants
```http
GET /api/tenants
Authorization: Bearer {{accessToken}}
```

### Get Tenant by ID
```http
GET /api/tenants/{{tenantId}}
Authorization: Bearer {{accessToken}}
```

### Update Tenant
```http
PUT /api/tenants/{{tenantId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "name": "Acme Corp Updated",
  "primaryColor": "#2196f3"
}
```

## 4. Users

### Get All Users
```http
GET /api/users
Authorization: Bearer {{accessToken}}
```

### Create User
```http
POST /api/users
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "email": "employee@acme.com",
  "password": "Password123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "employeeInfo": {
    "employeeId": "EMP001",
    "department": "Engineering",
    "designation": "Software Engineer",
    "joiningDate": "2024-01-15",
    "employmentType": "full-time"
  }
}
```

### Get User by ID
```http
GET /api/users/{{userId}}
Authorization: Bearer {{accessToken}}
```

### Update User
```http
PUT /api/users/{{userId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1-555-0123"
}
```

### Delete User
```http
DELETE /api/users/{{userId}}
Authorization: Bearer {{accessToken}}
```

## 5. Timesheets

### Get All Timesheets
```http
GET /api/timesheets
Authorization: Bearer {{accessToken}}
```

### Create Timesheet
```http
POST /api/timesheets
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "date": "2024-01-15",
  "projectName": "Project Alpha",
  "taskDescription": "Implemented user authentication",
  "hours": 8,
  "billable": true,
  "notes": "Completed ahead of schedule"
}
```

### Get Timesheet by ID
```http
GET /api/timesheets/{{timesheetId}}
Authorization: Bearer {{accessToken}}
```

### Update Timesheet
```http
PUT /api/timesheets/{{timesheetId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "hours": 7.5,
  "taskDescription": "Implemented user authentication and tests"
}
```

### Submit Timesheet
```http
POST /api/timesheets/{{timesheetId}}/submit
Authorization: Bearer {{accessToken}}
```

### Approve Timesheet
```http
POST /api/timesheets/{{timesheetId}}/approve
Authorization: Bearer {{accessToken}}
```

### Reject Timesheet
```http
POST /api/timesheets/{{timesheetId}}/reject
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "rejectionReason": "Insufficient detail in task description"
}
```

### Delete Timesheet
```http
DELETE /api/timesheets/{{timesheetId}}
Authorization: Bearer {{accessToken}}
```

## 6. Documents

### Get All Documents
```http
GET /api/documents
Authorization: Bearer {{accessToken}}
```

### Upload Document
```http
POST /api/documents
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data

Form Data:
- file: [binary file]
- category: visa
- description: H1B Visa Document
- tags: visa,h1b,immigration
```

### Get Document by ID
```http
GET /api/documents/{{documentId}}
Authorization: Bearer {{accessToken}}
```

### Sign Document
```http
POST /api/documents/{{documentId}}/sign
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "signatureData": "data:image/png;base64,iVBORw0KG..."
}
```

### Download Document
```http
GET /api/documents/{{documentId}}/download
Authorization: Bearer {{accessToken}}
```

### Delete Document
```http
DELETE /api/documents/{{documentId}}
Authorization: Bearer {{accessToken}}
```

## 7. Leaves

### Get All Leaves
```http
GET /api/leaves
Authorization: Bearer {{accessToken}}
```

### Request Leave
```http
POST /api/leaves
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "leaveType": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "days": 5,
  "reason": "Family vacation"
}
```

### Get Leave by ID
```http
GET /api/leaves/{{leaveId}}
Authorization: Bearer {{accessToken}}
```

### Update Leave
```http
PUT /api/leaves/{{leaveId}}
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "reason": "Updated: Family vacation to Hawaii"
}
```

### Approve Leave
```http
POST /api/leaves/{{leaveId}}/approve
Authorization: Bearer {{accessToken}}
```

### Reject Leave
```http
POST /api/leaves/{{leaveId}}/reject
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "rejectionReason": "Insufficient leave balance"
}
```

### Cancel Leave
```http
DELETE /api/leaves/{{leaveId}}
Authorization: Bearer {{accessToken}}
```

## 8. Notifications

### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {{accessToken}}
```

### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer {{accessToken}}
```

### Mark Notification as Read
```http
PUT /api/notifications/{{notificationId}}/read
Authorization: Bearer {{accessToken}}
```

### Mark All as Read
```http
PUT /api/notifications/read-all
Authorization: Bearer {{accessToken}}
```

## 9. Analytics

### Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer {{accessToken}}
```

### Timesheet Analytics
```http
GET /api/analytics/timesheets
Authorization: Bearer {{accessToken}}
```

### Leave Analytics
```http
GET /api/analytics/leaves
Authorization: Bearer {{accessToken}}
```

### User Analytics
```http
GET /api/analytics/users
Authorization: Bearer {{accessToken}}
```

## Postman Environment Variables

Create these variables in Postman:

```
baseUrl: http://localhost:3000
tenantId: [Your Tenant ID]
accessToken: [JWT Access Token from login]
refreshToken: [JWT Refresh Token from login]
userId: [User ID]
timesheetId: [Timesheet ID]
documentId: [Document ID]
leaveId: [Leave ID]
notificationId: [Notification ID]
resetToken: [Reset Token from verify-otp]
```

## Common Headers

For all authenticated requests:
```
Authorization: Bearer {{accessToken}}
Content-Type: application/json
```

For file uploads:
```
Authorization: Bearer {{accessToken}}
Content-Type: multipart/form-data
```

## Response Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

## Testing Workflow

1. **Create Tenant** (or use existing)
2. **Register User**
3. **Login** and save accessToken
4. **Test Protected Routes** with the token
5. **Test Password Reset Flow**
6. **Create Data** (Timesheets, Leaves, Documents)
7. **Test Approval Workflows**
8. **Test Analytics**

## Tips

- Save the accessToken from login response to environment variable
- Use Postman Collections to organize requests
- Create separate environments for dev/staging/prod
- Test rate limiting by making multiple rapid requests
- Verify email templates by checking your email inbox
- Use MongoDB Compass to verify data changes

Happy Testing! 🚀
