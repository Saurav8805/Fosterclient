# Foster Kids Management System

A comprehensive school management system for Foster Kids Play School Chain, built with modern web technologies. The system consists of a Next.js frontend (Fosterclient) and an Express.js backend (Fostercore) with Supabase as the database.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [Features](#-features)
- [Development](#-development)
- [Security](#-security)
- [Migration Status](#-migration-status)

---

## 🎯 Project Overview

Foster Kids Management System is a full-stack web application designed to streamline school operations including:

- **Student Management**: Admission, records, attendance, and progress tracking
- **Staff Management**: Employee records, attendance, and salary management
- **Academic Operations**: Homework assignments, syllabus management, and progress reports
- **Financial Management**: Fee collection and tracking
- **Communication**: Events calendar, gallery, and behavior tracking
- **Role-Based Access**: Different dashboards for Admin, Faculty, Teachers, and Students

---

## 🏗️ Architecture

The system follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Foster Kids System                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   Fosterclient   │◄────────────►│   Fostercore     │    │
│  │   (Frontend)     │   REST API   │   (Backend)      │    │
│  │                  │              │                  │    │
│  │  Next.js 14      │              │  Express.js      │    │
│  │  React           │              │  Node.js         │    │
│  │  TypeScript      │              │  JavaScript      │    │
│  │  Port: 3001      │              │  Port: 5000      │    │
│  └──────────────────┘              └──────────────────┘    │
│                                              │               │
│                                              ▼               │
│                                     ┌──────────────────┐    │
│                                     │    Supabase      │    │
│                                     │   (PostgreSQL)   │    │
│                                     └──────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Communication Flow

1. **Frontend (Fosterclient)** → Makes HTTP requests via centralized API client (`src/lib/api.ts`)
2. **Backend (Fostercore)** → Processes requests, handles business logic, interacts with database
3. **Database (Supabase)** → Stores all application data with Row Level Security (RLS)

---

## 🛠️ Tech Stack

### Frontend (Fosterclient)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.0.0 | React framework with SSR/SSG |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.2.2 | Type safety |
| **Tailwind CSS** | 3.4.19 | Styling |
| **Supabase Client** | 2.104.0 | Database client (direct access) |

### Backend (Fostercore)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Express.js** | 4.18.2 | Web framework |
| **Node.js** | - | Runtime environment |
| **Supabase Client** | 2.104.0 | Database operations |
| **bcryptjs** | 3.0.3 | Password hashing |
| **CORS** | 2.8.5 | Cross-origin requests |
| **Helmet** | 7.1.0 | Security headers |
| **Morgan** | 1.10.0 | Request logging |
| **dotenv** | 16.4.5 | Environment variables |

### Database

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database with built-in auth and RLS |
| **PostgreSQL** | Relational database |

---

## 📁 Project Structure

```
Foster-Kids-Management-System/
│
├── Fosterclient/                    # Frontend Application
│   ├── public/                      # Static assets
│   │   ├── LOGO-2.png              # School logo
│   │   ├── pic1.jpg - pic4.jpg     # Gallery images
│   │   └── _headers                # Netlify headers config
│   │
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── dashboard/          # Dashboard pages
│   │   │   │   ├── add-staff/      # Add staff member
│   │   │   │   ├── admit-student/  # Admit new student
│   │   │   │   ├── behaviour/      # Student behavior tracking
│   │   │   │   ├── calendar/       # Events calendar
│   │   │   │   ├── class-list/     # Class management
│   │   │   │   ├── fees/           # Fee management
│   │   │   │   ├── gallery/        # Photo gallery
│   │   │   │   ├── homework/       # Homework assignments
│   │   │   │   ├── profile/        # User profile
│   │   │   │   ├── reports/        # Progress reports
│   │   │   │   ├── salary/         # Salary management
│   │   │   │   ├── staff-attendance/    # Staff attendance
│   │   │   │   ├── staff-list/     # Staff directory
│   │   │   │   ├── student-attendance/  # Student attendance
│   │   │   │   ├── student-list/   # Student directory
│   │   │   │   ├── syllabus/       # Syllabus management
│   │   │   │   ├── layout.tsx      # Dashboard layout
│   │   │   │   └── page.tsx        # Dashboard home
│   │   │   │
│   │   │   ├── login/              # Login page
│   │   │   ├── globals.css         # Global styles
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── page.tsx            # Landing page
│   │   │
│   │   ├── components/             # React components
│   │   │   ├── ui/                 # UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   └── sidebar.tsx
│   │   │   │
│   │   │   ├── About.tsx           # Landing page sections
│   │   │   ├── Advantages.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── HeaderContent.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Programs.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── Testimonials.tsx
│   │   │
│   │   └── lib/                    # Utilities
│   │       ├── api.ts              # ⭐ Centralized API client
│   │       ├── database.types.ts   # TypeScript types
│   │       └── supabase.ts         # Supabase client
│   │
│   ├── .env                        # Environment variables
│   ├── next.config.js              # Next.js configuration
│   ├── package.json                # Dependencies
│   ├── tailwind.config.js          # Tailwind configuration
│   └── tsconfig.json               # TypeScript configuration
│
├── Fostercore/                     # Backend Application
│   ├── src/
│   │   ├── config/                 # Configuration
│   │   │   ├── auth.js             # Auth config
│   │   │   └── database.js         # Database connection
│   │   │
│   │   ├── middleware/             # Express middleware
│   │   │   ├── auth.middleware.js  # Authentication
│   │   │   └── error.middleware.js # Error handling
│   │   │
│   │   ├── routes/                 # API routes
│   │   │   ├── attendance.routes.js    # Student attendance
│   │   │   ├── auth.routes.js          # Authentication
│   │   │   ├── behaviour.routes.js     # Behavior tracking
│   │   │   ├── config.routes.js        # Configuration data
│   │   │   ├── events.routes.js        # Calendar events
│   │   │   ├── fees.routes.js          # Fee management
│   │   │   ├── gallery.routes.js       # Gallery
│   │   │   ├── homework.routes.js      # Homework
│   │   │   ├── progress.routes.js      # Academic progress
│   │   │   ├── staff.routes.js         # Staff management
│   │   │   ├── students.routes.js      # Student management
│   │   │   └── users.routes.js         # User profiles
│   │   │
│   │   ├── utils/                  # Utilities
│   │   │   └── helpers.js          # Helper functions
│   │   │
│   │   └── server.js               # ⭐ Express server entry point
│   │
│   ├── .env                        # Environment variables
│   └── package.json                # Dependencies
│
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Supabase account** (for database)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd Foster-Kids-Management-System
```

#### 2. Setup Backend (Fostercore)

```bash
cd Fostercore

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Add your Supabase credentials

# Start development server
npm run dev
```

Backend will run on **http://localhost:5000**

#### 3. Setup Frontend (Fosterclient)

```bash
cd Fosterclient

# Install dependencies
npm install

# Create .env file (see Environment Variables section)
# Add your API URL and Supabase credentials

# Start development server
npm run dev
```

Frontend will run on **http://localhost:3001**

#### 4. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🔐 Environment Variables

### Frontend (.env in Fosterclient/)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Supabase Configuration (for direct database access if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env in Fostercore/)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication - Default Passwords
DEFAULT_STUDENT_PASSWORD=default123
DEFAULT_STAFF_PASSWORD=foster@123

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

---

## 📡 API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-domain.com/api
```

### API Client Usage (Frontend)

The frontend uses a centralized API client located at `Fosterclient/src/lib/api.ts`:

```typescript
import { authApi, studentsApi, staffApi } from '@/lib/api';

// Login
const response = await authApi.login(mobile, password);

// Get students
const students = await studentsApi.list();

// Add staff
const newStaff = await staffApi.add(staffData);
```

### Available API Modules

| Module | Description | Endpoints |
|--------|-------------|-----------|
| **authApi** | Authentication | `login()`, `register()` |
| **studentsApi** | Student management | `list()`, `admit()`, `update()`, `delete()`, `getTeachers()` |
| **staffApi** | Staff management | `list()`, `add()`, `update()`, `delete()`, `getAttendance()`, `markAttendance()` |
| **attendanceApi** | Student attendance | `mark()`, `getMyAttendance()` |
| **feesApi** | Fee management | `getMyFees()`, `update()` |
| **progressApi** | Academic progress | `add()`, `getMyProgress()` |
| **behaviourApi** | Behavior tracking | `add()`, `getMyBehaviour()` |
| **homeworkApi** | Homework | `list()`, `create()`, `update()`, `delete()` |
| **eventsApi** | Calendar events | `list()`, `create()`, `update()`, `delete()` |
| **galleryApi** | Gallery | `list()`, `add()`, `delete()` |
| **usersApi** | User profiles | `getProfile()` |
| **configApi** | Configuration | `getClasses()`, `getSections()`, `getDepartments()`, `getDesignations()`, `getConstants()` |

### API Endpoints

#### Authentication

```
POST   /api/auth/login       - User login
POST   /api/auth/register    - User registration
```

#### Students

```
GET    /api/students/list           - Get all students
POST   /api/students/admit          - Admit new student
PUT    /api/students/update/:id     - Update student
DELETE /api/students/delete/:id     - Delete student
GET    /api/students/teachers       - Get all teachers
```

#### Staff

```
GET    /api/staff/list              - Get all staff
POST   /api/staff/add               - Add new staff
PUT    /api/staff/update/:id        - Update staff
DELETE /api/staff/delete/:id        - Delete staff
GET    /api/staff/attendance        - Get staff attendance
POST   /api/staff/attendance        - Mark staff attendance
```

#### Attendance

```
POST   /api/attendance/mark         - Mark student attendance
GET    /api/attendance/my-attendance - Get student attendance
```

#### Fees

```
GET    /api/fees/my-fees            - Get student fees
PUT    /api/fees/update             - Update fee record
```

#### Progress

```
POST   /api/progress/add            - Add progress report
GET    /api/progress/my-progress    - Get student progress
```

#### Behaviour

```
POST   /api/behaviour/add           - Add behavior record
GET    /api/behaviour/my-behaviour  - Get student behavior
```

#### Homework

```
GET    /api/homework/list           - Get homework list
POST   /api/homework                - Create homework
PUT    /api/homework/:id            - Update homework
DELETE /api/homework/:id            - Delete homework
```

#### Events

```
GET    /api/events                  - Get all events
POST   /api/events                  - Create event
PUT    /api/events/:id              - Update event
DELETE /api/events/:id              - Delete event
```

#### Gallery

```
GET    /api/gallery                 - Get all images
POST   /api/gallery                 - Add image
DELETE /api/gallery/:id             - Delete image
```

#### Users

```
GET    /api/users/profile           - Get user profile
```

#### Configuration

```
GET    /api/config/classes          - Get available classes
GET    /api/config/sections         - Get available sections
GET    /api/config/departments      - Get departments
GET    /api/config/designations     - Get designations
GET    /api/config/constants        - Get system constants
```

---

## 🗄️ Database Schema

### Core Tables

#### users
Primary user authentication and profile table.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| mobile | varchar | Login ID (unique) |
| password_hash | varchar | Hashed password (bcrypt) |
| role | integer | User role (6=Admin, 7=Teacher, 8=Faculty, 19=Student) |
| full_name | varchar | Full name |
| email | varchar | Email address |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### students
Student-specific information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| teacher_id | uuid | Assigned teacher |
| class | varchar | Class (Nursery, LKG, UKG) |
| section | varchar | Section (A, B, C) |
| roll_no | integer | Roll number |
| dob | date | Date of birth |
| blood_group | varchar | Blood group |
| address | text | Address |
| city | varchar | City |
| state | varchar | State |
| pincode | varchar | Pincode |
| emergency_contact | varchar | Emergency contact number |
| created_at | timestamp | Creation timestamp |

#### staff
Staff-specific information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users |
| created_at | timestamp | Creation timestamp |

**Note**: The `staff` table currently has minimal columns. Additional fields like `designation`, `department`, `salary`, `joining_date` may not exist in the current schema.

#### attendance
Student attendance records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to users (student) |
| date | date | Attendance date |
| status | varchar | Present/Absent/Leave |
| subject | varchar | Subject (optional) |
| created_at | timestamp | Creation timestamp |

#### fees
Fee management records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| student_id | uuid | Foreign key to students |
| total_fees | numeric | Total fee amount |
| paid_amount | numeric | Amount paid |
| pending_amount | numeric | Amount pending |
| due_date | date | Payment due date |
| status | varchar | Payment status |
| created_at | timestamp | Creation timestamp |

#### homework
Homework assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| class | varchar | Target class |
| subject | varchar | Subject |
| description | text | Homework description |
| due_date | date | Due date |
| assigned_by | uuid | Teacher ID |
| created_at | timestamp | Creation timestamp |

#### behaviour
Student behavior tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| student_id | uuid | Foreign key to students |
| teacher_id | uuid | Foreign key to users (teacher) |
| rating | integer | Behavior rating (1-5) |
| comment | text | Teacher's comment |
| date | date | Record date |
| created_at | timestamp | Creation timestamp |

#### progress
Academic progress reports.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| student_id | uuid | Foreign key to students |
| subject | varchar | Subject name |
| marks | numeric | Marks obtained |
| total_marks | numeric | Total marks |
| grade | varchar | Grade (A, B, C, etc.) |
| percentage | numeric | Percentage |
| created_at | timestamp | Creation timestamp |

#### events
Calendar events.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | varchar | Event title |
| description | text | Event description |
| date | date | Event date |
| type | varchar | Event type |
| created_at | timestamp | Creation timestamp |

#### gallery
Photo gallery.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | varchar | Image title |
| image_url | varchar | Image URL |
| uploaded_at | timestamp | Upload timestamp |

---

## 👥 User Roles

The system supports role-based access control with the following roles:

| Role ID | Role Name | Access Level | Description |
|---------|-----------|--------------|-------------|
| **6** | Admin | Full Access | Complete system access, all features |
| **7** | Teacher | Limited | Access to assigned students only |
| **8** | Faculty | Extended | Access to multiple classes and features |
| **19** | Student | Personal | Access to personal data only |

### Role-Based Features

#### Admin (Role 6)
- Full dashboard with statistics
- Student management (admit, update, delete)
- Staff management (add, update, delete)
- Attendance management (students & staff)
- Fee management
- Salary management
- Homework assignments
- Behavior tracking
- Progress reports
- Calendar & events
- Gallery management
- Syllabus management

#### Faculty (Role 8)
- Faculty dashboard
- View all students
- View all staff
- Mark attendance
- Assign homework
- View syllabus

#### Teacher (Role 7)
- Teacher dashboard
- View assigned students
- Mark attendance for assigned students
- Assign homework
- View syllabus

#### Student (Role 19)
- Student dashboard
- View personal profile
- View attendance
- View homework
- View progress reports
- View fees

---

## ✨ Features

### 🎓 Student Management
- **Admission**: Admit new students with complete details
- **Student List**: View, search, and filter all students
- **Student Profiles**: Detailed student information
- **Attendance**: Mark and track daily attendance
- **Progress Reports**: Academic performance tracking
- **Behavior Tracking**: Monitor student behavior

### 👨‍🏫 Staff Management
- **Staff Directory**: Complete staff list with details
- **Add Staff**: Onboard new staff members
- **Staff Attendance**: Track staff attendance
- **Salary Management**: Manage staff salaries

### 📚 Academic Operations
- **Homework**: Assign and track homework
- **Syllabus**: Manage course syllabus
- **Class Management**: Organize classes and sections
- **Progress Reports**: Generate academic reports

### 💰 Financial Management
- **Fee Collection**: Track fee payments
- **Fee Status**: Monitor pending and paid fees
- **Salary**: Manage staff salaries

### 📅 Communication & Events
- **Calendar**: School events and holidays
- **Gallery**: Photo gallery for school activities
- **Notifications**: System notifications (UI ready)

### 🔒 Security Features
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Different access levels
- **Content Security Policy**: CSP headers configured
- **CORS Protection**: Controlled cross-origin access
- **Helmet.js**: Security headers

---

## 💻 Development

### Frontend Development

```bash
cd Fosterclient

# Development server (port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Backend Development

```bash
cd Fostercore

# Development server with auto-reload (port 5000)
npm run dev

# Production server
npm start
```

### Code Structure Guidelines

#### Frontend
- **Pages**: Use Next.js App Router in `src/app/`
- **Components**: Reusable components in `src/components/`
- **API Calls**: Always use the centralized API client from `src/lib/api.ts`
- **Styling**: Use Tailwind CSS utility classes
- **Types**: Define TypeScript types in `src/lib/database.types.ts`

#### Backend
- **Routes**: Define routes in `src/routes/`
- **Middleware**: Add middleware in `src/middleware/`
- **Database**: Use Supabase client from `src/config/database.js`
- **Helpers**: Utility functions in `src/utils/helpers.js`
- **Error Handling**: Use centralized error middleware

### Content Security Policy (CSP)

The frontend has CSP configured in `next.config.js`:

**Development Mode**:
- Allows connections to `http://localhost:5000` (backend)
- Allows connections to Supabase
- Allows `unsafe-eval` and `unsafe-inline` for development

**Production Mode**:
- Stricter CSP without `unsafe-eval`
- Only allows HTTPS connections
- Connects to Supabase only

---

## 🔒 Security

### Password Security
- **Only passwords are hashed** using bcryptjs (10 salt rounds)
- All other data is stored as plain text
- Default passwords:
  - Students: `default123`
  - Staff: `foster@123`

### Authentication
- Mobile number is used as login ID
- Password verification using bcrypt
- No JWT implementation yet (planned for future)

### Database Security
- Supabase Row Level Security (RLS) enabled
- Service role key used for admin operations
- Anon key used for regular operations

### API Security
- CORS configured to allow only frontend origin
- Helmet.js for security headers
- Input validation on all endpoints
- Error messages don't expose sensitive information

---

## 📊 Migration Status

### Frontend-Backend Migration Progress

The system has been migrated from Next.js API routes to Express backend API.

**Status**: **83% Complete** (15 out of 18 pages migrated)

#### ✅ Completed Migrations (15 pages)

1. **Login** - `authApi.login()`
2. **Dashboard Home** - `studentsApi.list()`, `staffApi.list()`
3. **Student List** - Full CRUD operations
4. **Admit Student** - `studentsApi.admit()`
5. **Staff List** - `staffApi.*`
6. **Add Staff** - `staffApi.add()`
7. **Student Attendance** - `attendanceApi.*`
8. **Staff Attendance** - `staffApi.getAttendance()`
9. **Fees** - `feesApi.*`
10. **Homework** - `homeworkApi.list()`
11. **Behaviour** - `behaviourApi.*`
12. **Profile** - `usersApi.getProfile()`
13. **Reports** - `progressApi.*`
14. **Calendar** - `eventsApi.*`
15. **Gallery** - `galleryApi.*`

#### ⏳ Pending Migrations (3 pages)

These pages need backend endpoints to be created:

1. **Syllabus** - Backend endpoint not yet implemented
2. **Class List** - Backend endpoint not yet implemented
3. **Salary** - Backend endpoint not yet implemented

### Known Issues

#### Staff Table Schema
The `staff` table currently has minimal columns:
- ✅ `id` (uuid)
- ✅ `user_id` (uuid)
- ✅ `created_at` (timestamp)
- ❓ `designation`, `department`, `salary`, `joining_date` - May not exist

**Current Workaround**: Backend creates staff with only `user_id` and attempts to update optional fields if they exist.

---

## 🤝 Contributing

This is a proprietary project for Foster Kids Play School Chain. For internal development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

---

## 📞 Support

For technical support or questions, contact the development team.

---

## 📄 License

Proprietary software for Foster Kids Play School Chain. All rights reserved.

---

## 🎉 Acknowledgments

Built with modern web technologies to provide the best experience for Foster Kids Play School Chain.

---

**Last Updated**: May 7, 2026
