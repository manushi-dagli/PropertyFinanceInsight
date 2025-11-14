# Property Finance Insight - Application Specification

## Project Overview

**Property Finance Insight** is a comprehensive Real Estate CRM and Accounting System designed for managing property development projects, tracking bookings, cancellations, and generating revenue recognition reports. The application follows a modern full-stack architecture with a React frontend and Express.js backend.

---

## Technology Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.1
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router DOM 6.26.2
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts 2.12.7
- **Excel Handling**: xlsx 0.18.5
- **HTTP Client**: Axios 1.10.0
- **Styling**: Tailwind CSS with shadcn/ui components

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **ORM**: Prisma 6.10.0
- **Database**: PostgreSQL
- **Validation**: Joi 17.13.3, class-validator 0.14.2
- **Logging**: Winston 3.17.0
- **CORS**: Enabled for frontend communication

### Database Schema

- **Provider**: PostgreSQL
- **ORM**: Prisma Client
- **Models**: Company, Project, Wing, Flat, Customer, Bookings, Cancellations

---

## Application Architecture

### Frontend Structure

```
frontend/
├── src/
│   ├── api/              # API service layer
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components (shadcn)
│   │   └── [Module].tsx  # Feature-specific components
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
```

### Backend Structure

```
backend/
├── controllers/         # Request handlers
├── services/           # Business logic layer
├── repositories/       # Data access layer
├── routes/             # API route definitions
├── middleware/         # Express middleware
├── config/             # Configuration (logger, Prisma)
├── types/              # TypeScript types
└── utils/              # Utility functions
```

---

## Core Features & Modules

### 1. Dashboard

**Location**: `src/pages/Index.tsx`

**Features**:

- Welcome screen with navigation instructions
- Sidebar navigation to all modules
- Global reporting date selector in header
- Real-time module switching

**Components**:

- `AppSidebar.tsx` - Navigation sidebar with icons
- `ReportingDate.tsx` - Global date selector component

---

### 2. Company Master

**Location**: `src/components/CompanyMaster.tsx`

**Purpose**: Manage company information and statutory details

**Features**:

- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Company information management:
  - Company Name (required)
  - CIN Number
  - PAN Number
  - GSTIN
  - Company Address
  - Contact Person Name
  - Contact Number
  - Email Address
- ✅ Excel Import/Export functionality
- ✅ Form validation
- ✅ Active/Inactive status management
- ✅ List view with edit/delete actions

**API Endpoints**:

- `GET /api/company` - Get all companies
- `POST /api/company` - Create company
- `PUT /api/company/:companyId` - Update company
- `DELETE /api/company/:companyId` - Delete company (soft delete)

**Data Storage**: PostgreSQL `company` table

---

### 3. Project Master

**Location**: `src/components/ProjectMaster.tsx`

**Purpose**: Manage real estate projects linked to companies

**Features**:

- ✅ CRUD operations for projects
- ✅ Project information:
  - Company selection (required)
  - Project Name (required)
  - Total Area of Construction (Sq. Mtr) - required
  - Report Date (auto-set from global reporting date)
- ✅ Cost Management:
  - Estimated Land Cost
  - Estimated Construction Cost
  - Actual Land Cost
  - Actual Construction Cost
  - Auto-calculated Total Estimated Cost
  - Auto-calculated Total Actual Cost
- ✅ Completion Metrics (auto-calculated):
  - Project Completion Percentage: (Total Actual / Total Estimated) × 100
  - Construction Completion Percentage: (Actual Construction / Estimated Construction) × 100
- ✅ Revenue Recognition Status:
  - Automatically determined: Revenue Recognized if Construction Completion ≥ 25%
  - Visual indicator (green/orange badge)
- ✅ Excel Import/Export (placeholder)
- ✅ Form validation
- ✅ List view with project details

**API Endpoints**:

- `GET /api/project` - Get all projects
- `POST /api/project` - Create project
- `PUT /api/project/:projectId` - Update project
- `DELETE /api/project/:projectId` - Delete project (soft delete)

**Data Storage**: PostgreSQL `project` table

**Business Logic**:

- Total Estimated Cost = Estimated Land Cost + Estimated Construction Cost
- Total Actual Cost = Actual Land Cost + Actual Construction Cost
- Revenue Recognition = Construction Completion ≥ 25%

---

### 4. Wing Master

**Location**: `src/components/WingMaster.tsx`

**Purpose**: Manage building wings within projects

**Features**:

- ✅ CRUD operations for wings
- ✅ Wing information:
  - Project selection (required)
  - Wing Name (required)
  - Construction Area (Sq.m) - required
- ✅ Area validation:
  - Ensures total wing construction area doesn't exceed project total area
  - Real-time area summary display (Total/Allocated/Remaining)
  - Duplicate wing name validation within same project
- ✅ Project area summary display
- ✅ Grouped list view by project
- ✅ Data persistence: localStorage (frontend-only)

**Data Storage**: localStorage `wings` key

**Business Logic**:

- Sum of all wing construction areas ≤ Project Total Area
- Wing names must be unique within a project

---

### 5. Flat Master

**Location**: `src/components/FlatMaster.tsx`

**Purpose**: Manage individual flats within wings

**Features**:

- ✅ CRUD operations for flats
- ✅ Flat information:
  - Wing selection (required)
  - Company Name selection
  - Flat Number (required)
  - Carpet Area (Sq.m) - required
  - Agreement Value
  - Status: Available, Booked, Sold, Blocked
- ✅ Area validation:
  - Ensures total flat carpet area doesn't exceed wing construction area
  - Real-time area summary display
  - Duplicate flat number validation within same wing
- ✅ Bulk operations:
  - Select All / Individual selection
  - Delete Selected
  - Delete All
- ✅ Excel Import/Export
- ✅ Grouped list view by wing
- ✅ Quick link to add customer for flat
- ✅ Data persistence: localStorage

**Data Storage**: localStorage `flats` key

**Business Logic**:

- Sum of all flat carpet areas ≤ Wing Construction Area
- Flat numbers must be unique within a wing

---

### 6. Customer Master

**Location**: `src/components/CustomerMaster.tsx`

**Purpose**: Manage customer information and flat assignments

**Features**:

- ✅ CRUD operations for customers
- ✅ Customer information:
  - Customer Name (required)
  - Flat assignment (required)
  - Contact Number (10 digits validation)
  - Email
  - Aadhar Number (12 digits validation)
  - Address
  - Pin Code (6 digits validation)
- ✅ Joint Owners management:
  - Add multiple joint owners
  - Remove joint owners
  - Same validation rules as primary customer
- ✅ Flat availability check:
  - Prevents duplicate flat assignments
  - Validation error if flat already occupied
- ✅ Bulk operations:
  - Select All / Individual selection
  - Delete Selected
  - Delete All
- ✅ Excel Import/Export
- ✅ Data persistence: localStorage

**Data Storage**: localStorage `customers` key

**Business Logic**:

- One customer per flat (enforced)
- Contact Number: exactly 10 digits
- Aadhar Number: exactly 12 digits
- Pin Code: exactly 6 digits

---

### 7. Booking Entry

**Location**: `src/components/BookingEntry.tsx`

**Purpose**: Record and track booking payments

**Features**:

- ✅ CRUD operations for booking payments
- ✅ Payment information:
  - Customer selection (required)
  - Payment Date (required)
  - Payer Name (customer or joint owner)
  - Mode of Payment: Cash, Cheque, NEFT/RTGS, UPI, Demand Draft
  - Amount Paid (required)
  - Agreement Value (required)
  - Booking Amount
- ✅ Bank details:
  - Customer Bank Name
  - Customer Account Number
  - Company Bank Name
  - Company Account Number
- ✅ Outstanding amount calculation:
  - Auto-calculated: Agreement Value - Total Payments Made
  - Real-time updates
  - Validation: Payment amount cannot exceed outstanding balance
- ✅ Payment history table view
- ✅ Bulk operations:
  - Select All / Individual selection
  - Delete Selected
  - Delete All
- ✅ Excel Import/Export
- ✅ Data persistence: localStorage

**Data Storage**: localStorage `bookingPayments` key

**Business Logic**:

- Outstanding Amount = Agreement Value - Sum of all payments for customer
- Payment amount validation: Cannot exceed remaining outstanding amount
- Multiple payments per customer supported

---

### 8. Cancellation Entry

**Location**: `src/components/CancellationEntry.tsx`

**Purpose**: Process refunds for cancelled bookings

**Features**:

- ✅ CRUD operations for cancellation refunds
- ✅ Refund information:
  - Customer selection (must have booking payments)
  - Refund Date (required)
  - Payee Name (customer or joint owner)
  - Mode of Payment
  - Amount Refunded (required)
  - Remarks
- ✅ Bank details:
  - Customer Bank Name
  - Customer Account Number
  - Company Bank Name
  - Company Account Number
- ✅ Refund validation:
  - Shows total paid by customer
  - Shows total already refunded
  - Shows available for refund
  - Validation: Refund amount cannot exceed available refund amount
- ✅ Payment summary display
- ✅ Bulk operations:
  - Select All / Individual selection
  - Delete Selected
  - Delete All
- ✅ Excel Import/Export
- ✅ Data persistence: localStorage

**Data Storage**: localStorage `cancellationPayments` key

**Business Logic**:

- Available for Refund = Total Paid - Total Already Refunded
- Refund amount validation: Cannot exceed available refund amount
- Only customers with booking payments can receive refunds

---

### 9. Revenue Recognition Report

**Location**: `src/components/RevenueRecognitionReport.tsx`

**Purpose**: Generate revenue recognition and work-in-progress reports

**Features**:

- ✅ Automatic calculation from multiple data sources:
  - Projects: Estimated/Actual costs, Total Construction Area
  - Flats: Carpet Area
  - Booking Entry: Agreement Value, Amount Received
- ✅ Revenue recognition criteria:
  - Eligible if Amount Received ≥ 10% of Agreement Value
- ✅ Cost calculations per flat:
  - Estimated Land Cost per Flat (X) = (Project Estimated Land Cost / Total Area) × Carpet Area
  - Estimated Construction Cost per Flat (Y) = (Project Estimated Construction Cost / Total Area) × Carpet Area
  - Estimated Flat Cost = X + Y
  - Actual Land Cost per Flat (M) = (Project Actual Land Cost / Total Area) × Carpet Area
  - Actual Construction Cost per Flat (N) = (Project Actual Construction Cost / Total Area) × Carpet Area
  - Actual Flat Cost = M + N
- ✅ Revenue recognition formula:
  - Revenue Recognition = (M + N) ÷ (X + Y) × Agreement Value
  - Work in Progress = Actual Flat Cost (M + N) if not eligible
- ✅ Filters:
  - Filter by Project
  - Filter by Flat Number
  - Filter by Payment Date Range
- ✅ Summary cards:
  - Total Agreement Value
  - Total Amount Received
  - Total Recognized Revenue
  - Total Work in Progress
- ✅ Detailed table view with all calculations
- ✅ CSV Export functionality
- ✅ Data source indicators
- ✅ Business logic documentation display

**Data Sources**:

- Projects (localStorage)
- Flats (localStorage)
- Booking Payments (localStorage)

**Business Logic**:

1. Revenue Eligibility: Amount Received ≥ 10% of Agreement Value
2. If eligible: Revenue Recognition = (Actual Flat Cost / Estimated Flat Cost) × Agreement Value
3. If not eligible: Work in Progress = Actual Flat Cost

---

## Excel Import/Export Features

### Supported Modules

1. **Company Master** - Import/Export company data
2. **Flat Master** - Import/Export flat data
3. **Customer Master** - Import/Export customer data
4. **Booking Entry** - Import/Export booking payments
5. **Cancellation Entry** - Import/Export cancellation refunds

### Excel Utilities

**Location**: `src/utils/excelUtils.ts`

**Features**:

- ✅ Read Excel files (.xlsx, .xls)
- ✅ Export data to Excel
- ✅ Template download functionality
- ✅ Data validation on import
- ✅ Preview before import
- ✅ Header validation

**Components**:

- `ExcelImportDialog.tsx` - Reusable import dialog component

---

## API Configuration

### Backend API

- **Base URL**: `http://localhost:3000`
- **API Prefix**: `/api`
- **CORS**: Enabled for `http://localhost:8080`

### Endpoints

#### Company API

- `GET /api/company` - List all active companies
- `POST /api/company` - Create new company
- `PUT /api/company/:companyId` - Update company
- `DELETE /api/company/:companyId` - Soft delete company

#### Project API

- `GET /api/project` - List all projects
- `POST /api/project` - Create new project
- `PUT /api/project/:projectId` - Update project
- `DELETE /api/project/:projectId` - Soft delete project

#### Health Check

- `GET /api/` - Health check endpoint

---

## Database Schema

### Models

#### Company (`company`)

- `id` (UUID, Primary Key)
- `company_name` (String, Required)
- `company_address` (String)
- `email_address` (String)
- `contact_number` (String)
- `gst_number` (String)
- `pan_number` (String)
- `cin_number` (String)
- `contact_person_name` (String)
- `is_active` (Boolean, Default: true)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### Project (`project`)

- `id` (UUID, Primary Key)
- `company_id` (UUID, Foreign Key → company)
- `project_name` (String, Required)
- `total_area` (Decimal)
- `estimated_land_cost` (Decimal)
- `estimated_construction_cost` (Decimal)
- `total_estimated_cost` (Decimal)
- `actual_land_cost` (Decimal)
- `actual_construction_cost` (Decimal)
- `total_actual_cost` (Decimal)
- `report_date` (Timestamp)
- `project_completion_percentage` (String)
- `construction_percentage` (String)
- `revenue_recognized` (Boolean)
- `is_active` (Boolean, Default: true)

#### Wing (`wing`)

- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key → project)
- `wing_name` (String, Required)
- `project_name` (String)
- `company_name` (String)
- `construction_area` (Decimal)

#### Flat (`flat`)

- `id` (UUID, Primary Key)
- `wing_id` (UUID, Foreign Key → wing)
- `flat_number` (String, Required)
- `carpet_area` (Decimal)
- `status` (String: Available, Booked, Sold, Blocked)
- `agreement_value` (Decimal)

#### Customer (`customer`)

- `id` (UUID, Primary Key)
- `customer_name` (String)
- `flat_id` (UUID, Foreign Key → flat)
- `contact_number` (Decimal)
- `email` (String)
- `aadhar_number` (String)
- `address` (String)
- `pin_code` (Decimal)

#### Bookings (`bookings`)

- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customer)
- `flat_id` (UUID, Foreign Key → flat)
- `payment_date` (Timestamp)
- `payer_name` (String)
- `mode_of_payment` (String)
- `amount_paid` (Decimal)
- `customer_bank_name` (String)
- `customer_account_no` (String)
- `company_bank_name` (String)
- `company_account_no` (String)
- `agreement_value` (Decimal)
- `booking_amount` (Decimal)
- `outstanding_amount` (Decimal)

#### Cancellations (`cancellations`)

- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key → customer)
- `flat_id` (UUID, Foreign Key → flat)
- `refund_date` (Timestamp)
- `payee_name` (String)
- `mode_of_payment` (String)
- `amount_refunded` (Decimal)
- `customer_bank_name` (String)
- `customer_account_no` (String)
- `company_bank_name` (String)
- `company_account_no` (String)
- `remarks` (String)

---

## Data Flow & Relationships

### Hierarchical Structure

```
Company
  └── Project
      └── Wing
          └── Flat
              └── Customer
                  ├── Booking Payments
                  └── Cancellation Refunds
```

### Data Dependencies

1. **Project** requires: Company
2. **Wing** requires: Project
3. **Flat** requires: Wing
4. **Customer** requires: Flat
5. **Booking Payment** requires: Customer, Flat
6. **Cancellation Refund** requires: Customer (with booking payments)

---

## Frontend State Management

### Server State (Backend API)

- **Company Data**: Fetched from `/api/company`
- **Project Data**: Fetched from `/api/project`
- Managed by React Query

### Client State (LocalStorage)

- **Wings**: `localStorage.getItem('wings')`
- **Flats**: `localStorage.getItem('flats')`
- **Customers**: `localStorage.getItem('customers')`
- **Booking Payments**: `localStorage.getItem('bookingPayments')`
- **Cancellation Payments**: `localStorage.getItem('cancellationPayments')`
- **Joint Owners**: `localStorage.getItem('jointOwners_${customerId}')`

### Global State

- **Reporting Date**: Managed in `Index.tsx` parent component
- **Active Tab**: Managed in `Index.tsx` for navigation

---

## Validation Rules

### Company Master

- Company Name: Required

### Project Master

- Company: Required
- Project Name: Required
- Total Area: Required, must be > 0, numeric

### Wing Master

- Project: Required
- Wing Name: Required, unique within project
- Construction Area: Required, must be > 0, numeric
- Total wing areas ≤ Project total area

### Flat Master

- Wing: Required
- Flat Number: Required, unique within wing
- Carpet Area: Required, must be > 0, numeric
- Total flat areas ≤ Wing construction area

### Customer Master

- Customer Name: Required
- Flat: Required, must be available
- Contact Number: 10 digits (if provided)
- Aadhar Number: 12 digits (if provided)
- Pin Code: 6 digits (if provided)
- Joint Owner Names: Required (if joint owners added)

### Booking Entry

- Customer: Required
- Payment Date: Required
- Payer Name: Required
- Amount Paid: Required, must be > 0
- Agreement Value: Required, must be > 0
- Payment amount ≤ Outstanding balance

### Cancellation Entry

- Customer: Required (must have booking payments)
- Refund Date: Required
- Payee Name: Required
- Amount Refunded: Required, must be > 0
- Refund amount ≤ Available refund amount

---

## UI/UX Features

### Design System

- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Theme**: Light mode (configurable for dark mode)

### User Experience

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Toast notifications for user feedback
- ✅ Form validation with error messages
- ✅ Loading states
- ✅ Confirmation dialogs
- ✅ Bulk selection and operations
- ✅ Search and filter capabilities
- ✅ Excel import preview
- ✅ Real-time calculations
- ✅ Visual status indicators (badges, colors)
- ✅ Sidebar navigation with icons
- ✅ Breadcrumb navigation
- ✅ Data tables with sorting

---

## Error Handling

### Frontend

- Toast notifications for errors
- Form validation errors
- API error handling via React Query
- Try-catch blocks in async operations

### Backend

- Winston logger for error logging
- Custom error handler middleware
- HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 404: Not Found
  - 500: Internal Server Error

---

## Security Considerations

### Current Implementation

- CORS enabled for frontend origin
- Input validation on frontend and backend
- SQL injection prevention via Prisma ORM
- Soft delete for data retention

### Recommendations for Production

- Authentication & Authorization
- API rate limiting
- Input sanitization
- HTTPS/SSL
- Environment variables for sensitive data
- Database connection pooling
- Row-level security (RLS) policies

---

## Performance Optimizations

### Frontend

- React Query for caching and refetching
- Component lazy loading (potential)
- Memoization where applicable
- LocalStorage for client-side data

### Backend

- Prisma query optimization
- Indexed database fields
- Efficient data fetching with select statements

---

## Testing Status

### Current State

- ✅ Manual testing through UI
- ⚠️ No automated test suite
- ⚠️ No unit tests
- ⚠️ No integration tests
- ⚠️ No E2E tests

### Recommendations

- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Component testing with React Testing Library

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Data Persistence**: Wings, Flats, Customers, Bookings, Cancellations stored in localStorage (not persisted to database)
2. **No Authentication**: No user login/authentication system
3. **No Multi-tenancy**: Single company/project view
4. **Excel Import**: Some modules have placeholder implementations
5. **Reporting**: Limited report customization options
6. **Audit Trail**: No change history tracking

### Recommended Enhancements

1. **Database Integration**: Move all localStorage data to PostgreSQL
2. **Authentication**: Add user authentication and role-based access control
3. **Multi-tenancy**: Support multiple companies/users
4. **Advanced Reporting**: More report types and customization
5. **Dashboard Analytics**: Charts and visualizations
6. **Email Notifications**: Automated email alerts
7. **Document Management**: Upload and store documents
8. **Payment Reminders**: Automated payment due reminders
9. **Export Formats**: PDF reports in addition to Excel/CSV
10. **Mobile App**: React Native mobile application

---

## Deployment Configuration

### Frontend

- **Port**: 8080
- **Build Command**: `npm run build`
- **Dev Server**: `npm run dev`
- **Environment Variables**: `VITE_API_BASE_URL` (defaults to `http://localhost:3000`)

### Backend

- **Port**: 3000
- **Host**: 0.0.0.0
- **Start Command**: `npm run dev` (development) or `npm start` (production)
- **Environment Variables**: `DATABASE_URL` (PostgreSQL connection string)

### Database

- **Provider**: PostgreSQL
- **Migration Tool**: Prisma Migrate
- **Schema Location**: `backend/prisma/schema.prisma`

---

## File Structure Summary

### Key Files

#### Frontend

- `src/App.tsx` - Main application component
- `src/pages/Index.tsx` - Main page with routing
- `src/components/AppSidebar.tsx` - Navigation sidebar
- `src/components/CompanyMaster.tsx` - Company management
- `src/components/ProjectMaster.tsx` - Project management
- `src/components/WingMaster.tsx` - Wing management
- `src/components/FlatMaster.tsx` - Flat management
- `src/components/CustomerMaster.tsx` - Customer management
- `src/components/BookingEntry.tsx` - Booking payment entry
- `src/components/CancellationEntry.tsx` - Cancellation refund entry
- `src/components/RevenueRecognitionReport.tsx` - Revenue report
- `src/utils/excelUtils.ts` - Excel import/export utilities

#### Backend

- `app.ts` - Express application entry point
- `routes/index.ts` - Route aggregator
- `controllers/company.controller.ts` - Company API handlers
- `controllers/project.controller.ts` - Project API handlers
- `services/company.service.ts` - Company business logic
- `services/project.service.ts` - Project business logic
- `repositories/company.repository.ts` - Company data access
- `repositories/project.repository.ts` - Project data access
- `prisma/schema.prisma` - Database schema

---

## Business Rules Summary

1. **Revenue Recognition**: Construction completion ≥ 25% OR Amount received ≥ 10% of agreement value
2. **Area Constraints**:
   - Sum of wing areas ≤ Project total area
   - Sum of flat carpet areas ≤ Wing construction area
3. **Flat Assignment**: One customer per flat (enforced)
4. **Payment Tracking**: Outstanding amount = Agreement value - Total payments
5. **Refund Tracking**: Available refund = Total paid - Total refunded
6. **Unique Constraints**:
   - Wing names unique within project
   - Flat numbers unique within wing

---

## Conclusion

This application provides a comprehensive solution for real estate project management, customer relationship management, financial tracking, and revenue recognition reporting. The system is designed with a modular architecture, making it easy to extend and maintain.

**Current Status**: Core functionality implemented and functional. Backend API partially implemented (Company and Project modules). Frontend fully functional with localStorage for client-side modules.

**Next Steps**:

1. Install backend dependencies (`npm install` in backend directory)
2. Set up PostgreSQL database
3. Run Prisma migrations
4. Complete backend API for all modules
5. Migrate localStorage data to database
6. Add authentication and authorization
7. Implement comprehensive testing

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
