# Foster Kids Management System

A comprehensive school management system built for Foster Kids Play School Chain to manage students, staff, attendance, fees, and academic progress.

## 🏫 About Foster Kids

Foster Kids Play School Chain was established with the vision to nurture children and lay a healthy foundation for a learned society. As a noble initiative of Foster Group of Schools, it has emerged as one of the leading play schools in India.

## 🚀 Features

### 👨‍💼 Admin Dashboard (Principal/Vice-Principal)
- **Student Management**: Admit new students, view all students, edit student information
- **Staff Management**: Add staff members, manage staff records, edit/delete staff
- **Attendance Tracking**: Mark and monitor student attendance across all classes
- **Fee Management**: Set fees, track payments, monitor pending amounts
- **Academic Progress**: Add marks, generate progress reports
- **Behavior Tracking**: Monitor and record student behavior
- **Gallery Management**: Upload and manage school photos and events
- **Comprehensive Reports**: Generate detailed academic and administrative reports

### 👩‍🏫 Faculty Dashboard (Teachers)
- **Assigned Students**: View and manage only assigned students
- **Attendance Management**: Mark attendance for assigned students
- **Progress Tracking**: Add marks and monitor academic progress
- **Behavior Records**: Add behavior comments and ratings
- **Homework Management**: Create and manage homework assignments
- **Gallery Access**: Upload photos to school gallery

### 👨‍🏫 Teacher Dashboard
- **Student Access**: View assigned students only
- **Attendance Marking**: Record daily attendance
- **Academic Tracking**: Add marks and progress notes
- **Behavior Monitoring**: Record behavior observations
- **Homework Creation**: Assign and manage homework

### 👨‍🎓 Student Dashboard
- **Personal Profile**: View and manage personal information
- **Attendance Records**: Check attendance history and statistics
- **Academic Progress**: View marks, grades, and progress reports
- **Fee Status**: Monitor fee payments and pending amounts
- **Behavior Reports**: View teacher feedback and behavior ratings
- **Homework**: Access assigned homework and submissions

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based authentication
- **Security**: Row Level Security (RLS) policies

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in bundler

## 📁 Project Structure

```
foster-kids-management/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── auth/              # Authentication endpoints
│   │   │   ├── students/          # Student management APIs
│   │   │   ├── staff/             # Staff management APIs
│   │   │   ├── attendance/        # Attendance tracking APIs
│   │   │   ├── fees/              # Fee management APIs
│   │   │   ├── progress/          # Academic progress APIs
│   │   │   ├── behaviour/         # Behavior tracking APIs
│   │   │   └── homework/          # Homework management APIs
│   │   ├── dashboard/             # Dashboard pages
│   │   │   ├── student-list/      # Student management
│   │   │   ├── staff-list/        # Staff management
│   │   │   ├── attendance/        # Attendance pages
│   │   │   ├── fees/              # Fee management
│   │   │   ├── reports/           # Academic reports
│   │   │   └── profile/           # User profiles
│   │   ├── login/                 # Authentication pages
│   │   └── globals.css            # Global styles
│   ├── components/                # Reusable UI components
│   │   ├── ui/                    # Base UI components
│   │   └── [component-files]      # Feature components
│   └── lib/                       # Utility libraries
│       ├── supabase.ts           # Database configuration
│       └── config/               # Configuration files
├── public/                        # Static assets
├── .env                          # Environment variables
└── README.md                     # Project documentation
```

## 🔐 Security Features

### Row Level Security (RLS)
- **Database-level security** ensuring users can only access authorized data
- **Role-based access control** with different permissions for each user type
- **Automatic policy enforcement** at the database level

### User Roles & Permissions
- **Admin (Role 6)**: Full system access
- **Faculty (Role 8)**: Assigned students + gallery management
- **Teacher (Role 7)**: Assigned students only
- **Student (Role 19)**: Personal data only

### Data Protection
- **Password hashing** using bcrypt
- **Environment variables** for sensitive configuration
- **Input validation** and sanitization
- **SQL injection prevention** through parameterized queries

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foster-kids-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DEFAULT_STUDENT_PASSWORD=default123
   DEFAULT_STAFF_PASSWORD=foster@123
   ```

4. **Database Setup**
   - Run the SQL scripts in Supabase:
     - `CHECK-DATABASE-STRUCTURE.sql` (verify setup)
     - `ENABLE-RLS-ALL-TABLES.sql` (enable security)

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 📊 Database Schema

### Core Tables
- **users**: User authentication and basic information
- **students**: Student-specific data and academic information
- **staff**: Staff member information and roles
- **attendance**: Daily attendance records
- **fees**: Fee structure and payment tracking
- **progress**: Academic progress and marks
- **behaviour**: Behavior tracking and teacher feedback
- **homework**: Homework assignments and submissions

### Relationships
- Students → Users (one-to-one)
- Students → Teachers (many-to-one)
- Attendance → Students (many-to-one)
- Progress → Students (many-to-one)
- Behaviour → Students (many-to-one)

## 🔧 Configuration

### Default Passwords
- **Students**: `default123`
- **Staff/Admin**: `foster@123`

### User Roles
- **6**: Admin (Principal/Vice-Principal)
- **7**: Teacher
- **8**: Faculty
- **19**: Student

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build test
npm run build
```

## 📈 Performance Features

- **Static Site Generation** for faster loading
- **Code Splitting** for optimized bundle sizes
- **Image Optimization** with Next.js Image component
- **Caching** strategies for API responses
- **Lazy Loading** for better performance

## 🔄 Data Flow

1. **Authentication**: Users log in with mobile number and password
2. **Role Detection**: System identifies user role and redirects to appropriate dashboard
3. **Data Fetching**: Role-based data fetching with RLS enforcement
4. **Real-time Updates**: Event-driven updates for live data synchronization
5. **Security**: All operations validated through RLS policies

## 🛡️ Security Best Practices

- **Environment Variables**: Sensitive data stored in `.env`
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries used throughout
- **XSS Protection**: Content properly escaped and sanitized
- **CSRF Protection**: API routes protected against cross-site requests
- **Role-based Access**: Database-level security with RLS policies

## 📞 Support & Contact

For technical support or questions about the Foster Kids Management System:

- **Email**: support@fosterkids.in
- **Website**: [https://fosterkids.in](https://fosterkids.in)
- **Phone**: Contact school administration

## 📄 License

This project is proprietary software developed for Foster Kids Play School Chain. All rights reserved.

---

**Foster Kids Management System** - Nurturing young minds through technology 🌟