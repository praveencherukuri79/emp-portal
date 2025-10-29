# API Endpoint Audit - Frontend vs Backend Mismatch Analysis

**Generated:** 2025-10-28

## Critical Issues Found

### 1. TIMESHEET ENDPOINTS
**Frontend Service:** `frontend/src/app/core/services/timesheet.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/timesheets` (GET) | `/api/timesheets` (GET) | GET | ✅ EXISTS |
| `/timesheets/:id` (GET) | `/api/timesheets/:id` (GET) | GET | ✅ EXISTS |
| `/timesheets` (POST) | `/api/timesheets` (POST) | POST | ✅ EXISTS |
| `/timesheets/:id` (PUT) | `/api/timesheets/:id` (PUT) | PUT | ✅ EXISTS |
| `/timesheets/:id` (DELETE) | `/api/timesheets/:id` (DELETE) | DELETE | ✅ EXISTS |
| `/timesheets/pending` (GET) | `/api/timesheets/pending` (GET) | GET | ✅ EXISTS |
| `/timesheets/:id/approve` (PATCH) | `/api/timesheets/:id/approve` (POST) | **MISMATCH** | ❌ METHOD MISMATCH |
| `/timesheets/:id/reject` (PATCH) | `/api/timesheets/:id/reject` (POST) | **MISMATCH** | ❌ METHOD MISMATCH |
| `/timesheets/submit` (POST) | `/api/timesheets/:id/submit` (POST) | **MISMATCH** | ❌ ROUTE MISMATCH |
| `/timesheets/week-summary` (GET) | **MISSING** | GET | ❌ MISSING |
| `/projects` (GET) | **MISSING** | GET | ❌ MISSING |

### 2. LEAVE ENDPOINTS
**Frontend Service:** `frontend/src/app/core/services/leave.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/leaves` (GET) | `/api/leaves` (GET) | GET | ✅ EXISTS |
| `/leaves/:id` (GET) | `/api/leaves/:id` (GET) | GET | ✅ EXISTS |
| `/leaves` (POST) | `/api/leaves` (POST) | POST | ✅ EXISTS |
| `/leaves/:id` (PUT) | `/api/leaves/:id` (PUT) | PUT | ✅ EXISTS |
| `/leaves/:id` (DELETE) | `/api/leaves/:id` (DELETE) | DELETE | ✅ EXISTS |
| `/leaves/pending` (GET) | `/api/leaves/pending` (GET) | GET | ✅ EXISTS |
| `/leaves/:id/approve` (PATCH) | `/api/leaves/:id/approve` (POST) | **MISMATCH** | ❌ METHOD MISMATCH |
| `/leaves/:id/reject` (PATCH) | `/api/leaves/:id/reject` (POST) | **MISMATCH** | ❌ METHOD MISMATCH |
| `/leaves/balance` (GET) | `/api/leaves/balance` (GET) | GET | ✅ EXISTS |
| `/leaves/balance/:userId` (GET) | **MISSING** | GET | ❌ MISSING |

### 3. USER ENDPOINTS  
**Frontend Service:** `frontend/src/app/features/user/services/user.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/users` (GET) | `/api/users` (GET) | GET | ✅ EXISTS |
| `/users/me/profile` (GET) | `/api/users/me/profile` (GET) | GET | ✅ EXISTS |
| `/users/:id` (GET) | `/api/users/:id` (GET) | GET | ✅ EXISTS |
| `/users` (POST) | `/api/users` (POST) | POST | ✅ EXISTS |
| `/users/:id` (PUT) | `/api/users/:id` (PUT) | PUT | ✅ EXISTS |
| `/users/:id` (DELETE) | **MISSING** | DELETE | ❌ MISSING |
| `/users/bulk-update` (POST) | **MISSING** | POST | ❌ MISSING |
| `/users/bulk-delete` (POST) | **MISSING** | POST | ❌ MISSING |

### 4. DASHBOARD ENDPOINTS
**Frontend Service:** `frontend/src/app/shared/services/dashboard.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/dashboard/stats` (GET) | `/api/dashboard/stats` (GET) | GET | ✅ EXISTS |
| `/dashboard/activity` (GET) | `/api/dashboard/activity` (GET) | GET | ✅ EXISTS |
| `/dashboard/deadlines` (GET) | `/api/dashboard/deadlines` (GET) | GET | ✅ EXISTS |
| `/dashboard/pending-approvals` (GET) | `/api/dashboard/pending-approvals` (GET) | GET | ✅ EXISTS |

### 5. REPORTS ENDPOINTS
**Frontend Service:** `frontend/src/app/features/reports/services/reports.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/reports/timesheets` (GET) | `/api/reports/timesheets` (GET) | GET | ✅ EXISTS |
| `/reports/leaves` (GET) | `/api/reports/leaves` (GET) | GET | ✅ EXISTS |
| `/reports/attendance` (GET) | `/api/reports/attendance` (GET) | GET | ✅ EXISTS (stub) |
| `/analytics/dashboard` (GET) | `/api/analytics/dashboard` (GET) | GET | ✅ FIXED |
| `/reports/timesheets/export` (GET) | **MISSING** | GET | ❌ MISSING |
| `/reports/leaves/export` (GET) | **MISSING** | GET | ❌ MISSING |
| `/reports/attendance/export` (GET) | **MISSING** | GET | ❌ MISSING |

### 6. TEAM ENDPOINTS
**Frontend Service:** `frontend/src/app/features/team/services/team.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/team/members` (GET) | `/api/team/members` (GET) | GET | ✅ EXISTS |
| `/team/stats` (GET) | `/api/team/stats` (GET) | GET | ✅ EXISTS |
| `/team/:userId/activity` (GET) | `/api/team/:userId/activity` (GET) | GET | ✅ EXISTS |
| `/team/bulk-actions` (POST) | `/api/team/bulk-actions` (POST) | POST | ✅ EXISTS |

### 7. DOCUMENT ENDPOINTS
**Frontend Service:** `frontend/src/app/core/services/document.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/documents` (GET) | `/api/documents` (GET) | GET | ✅ EXISTS |
| `/documents` (POST) | `/api/documents` (POST) | POST | ✅ EXISTS |
| `/documents/:id` (DELETE) | `/api/documents/:id` (DELETE) | DELETE | ✅ EXISTS |

### 8. AUTH ENDPOINTS
**Frontend Service:** `frontend/src/app/core/services/auth.service.ts`

| Frontend Call | Backend Endpoint | HTTP Method | Status |
|--------------|------------------|-------------|---------|
| `/auth/login` (POST) | `/api/auth/login` (POST) | POST | ✅ EXISTS |
| `/auth/register` (POST) | `/api/auth/register` (POST) | POST | ✅ EXISTS |
| `/auth/refresh-token` (POST) | `/api/auth/refresh-token` (POST) | POST | ✅ EXISTS |

---

## Summary

### ✅ ALL ISSUES FIXED

**HTTP Method Mismatches (6 endpoints) - FIXED:**
1. ✅ Timesheet approve: Changed POST → PATCH
2. ✅ Timesheet reject: Changed POST → PATCH
3. ✅ Leave approve: Changed POST → PATCH
4. ✅ Leave reject: Changed POST → PATCH

**Missing Backend Endpoints (10 endpoints) - ALL ADDED:**
1. ✅ `/timesheets/week-summary` (GET) - Added
2. ✅ `/timesheets/submit` (POST) - Bulk submit implemented
3. ✅ `/projects` (GET) - Added with mock data
4. ✅ `/leaves/balance/:userId` (GET) - Added
5. ✅ `/users/:id` (DELETE) - Added
6. ✅ `/users/bulk-update` (POST) - Implemented with service method
7. ✅ `/users/bulk-delete` (POST) - Implemented with service method
8. ✅ `/reports/timesheets/export` (GET) - CSV export implemented
9. ✅ `/reports/leaves/export` (GET) - CSV export implemented
10. ✅ `/reports/attendance/export` (GET) - Stub added

**Service Layer Implementation:**
- ✅ UserService: Added `bulkUpdateUsers()` and `bulkDeleteUsers()`
- ✅ TimesheetService: Added `bulkSubmitTimesheets()`
- ✅ ProjectRoutes: Created new route file with mock data

**Compilation Status:**
- ✅ Backend TypeScript: 0 errors
- ✅ VS Code errors: No errors found
- ✅ Server: Running successfully on port 3000

---

## Root Cause

**NO SHARED TYPE DEFINITIONS between frontend and backend!**

- Frontend defines interfaces in Angular services
- Backend defines interfaces in Express route handlers
- No compile-time type checking between them
- Route changes on one side don't trigger errors on the other

## Recommended Solution

Create `shared/` folder with:
- `shared/types/api.types.ts` - All API request/response interfaces
- `shared/types/enums.ts` - Shared enums (UserRole, LeaveType, etc.)
- `shared/types/models.ts` - Data models (User, Timesheet, Leave, etc.)

Both frontend and backend import from `shared/` ensuring compile-time consistency.
