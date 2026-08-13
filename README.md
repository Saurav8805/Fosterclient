# 🎨 Foster Kids Management System - Frontend

Modern, responsive frontend built with Next.js 14 and TypeScript for the Foster Kids School Management System.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Excel Export**: xlsx library
- **Icons**: Heroicons (inline SVG)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env.local

# Start development server
npm run dev

# The app will run on http://localhost:3000
```

## 🔐 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   ├── students/             # Student management
│   │   │   ├── admit-student/        # Add new student
│   │   │   ├── class-list/           # View students by class
│   │   │   ├── staff-list/           # Staff management
│   │   │   ├── add-staff/            # Add new staff
│   │   │   ├── student-attendance/   # Student attendance
│   │   │   ├── staff-attendance/     # Staff attendance
│   │   │   ├── fees/                 # Fee management
│   │   │   ├── reports/              # Academic progress
│   │   │   ├── behaviour/            # Behaviour tracking
│   │   │   ├── homework/             # Homework management
│   │   │   ├── calendar/             # Events calendar
│   │   │   ├── gallery/              # Photo gallery
│   │   │   ├── syllabus/             # Syllabus management
│   │   │   └── salary/               # Salary management
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   └── ui/
│   │       ├── Card.tsx              # Card component
│   │       └── [other components]    # Reusable UI components
│   ├── lib/
│   │   └── api.ts                    # API client functions
│   └── types/                        # TypeScript type definitions
├── public/
│   ├── favicon.ico
│   ├── LOGO-2.png
│   └── [images]
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## 🎯 Key Features

### 📊 Dashboard
- Role-based dashboard views
- Quick statistics cards
- Recent activities
- Quick action buttons

### 👨‍🎓 Student Management
- Student list with search and filters
- Add/Edit student profiles
- View detailed student information
- Class-wise student listing
- Student profile modal with tabs (Details, Attendance, Fees, Progress, Behaviour)

### 👨‍🏫 Staff Management
- Staff directory
- Add/Edit staff profiles
- Salary management
- Staff attendance tracking

### 📅 Attendance
- Calendar-based date selection
- Bulk attendance marking
- Color-coded status (Present/Absent/Leave)
- View attendance summary
- Export to Excel
- Day-wise attendance records
- Student personal attendance view

### 💰 Fee Management
- Fee status tracking
- Payment recording
- Pending amount calculation
- Fee history
- Student fee dashboard

### 📈 Academic Progress
- Term-wise marks entry
- Subject-wise grades
- Progress reports
- Class performance analytics
- Export marks to Excel

### 🎯 Behaviour Tracking
- Positive/Negative/Neutral incidents
- Date-wise records
- Action taken notes
- Student behaviour history

### 📚 Homework
- Create homework assignments
- Class and section filtering
- Due date tracking
- Subject-wise homework

### 📆 Events & Calendar
- School events listing
- Event categories
- Date-wise event view
- Event management

### 🖼️ Gallery
- Photo uploads
- Category-wise organization
- Image display grid

### 📋 Syllabus
- Class-wise syllabus
- Subject-wise topics
- Completion status tracking

## 🎨 UI Components

### Card Component
```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray (#6B7280)

## 🔐 Authentication

### Login Flow
1. User enters mobile and password
2. API validates credentials
3. JWT token stored in localStorage
4. User redirected to dashboard

### Protected Routes
All dashboard routes require authentication. Middleware checks for valid token.

### Role-Based UI
```typescript
const userRole = localStorage.getItem('userRole')

{userRole === '6' && <AdminFeature />}
{userRole === '7' && <TeacherFeature />}
{userRole === '19' && <StudentFeature />}
```

## 📱 Responsive Design

- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: 
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Deploy to Netlify
1. Push code to GitHub
2. Connect repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

## 🎨 Styling Guidelines

### Tailwind CSS Classes
- Use utility-first approach
- Consistent spacing (4px base unit)
- Hover states for interactive elements
- Transition effects for smooth UX

### Common Patterns
```tsx
// Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
  Click Me
</button>

// Input
<input className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Card
<div className="bg-white rounded-lg shadow-sm border p-6">
  Content
</div>
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 State Management

Currently using React Hooks:
- `useState` - Component state
- `useEffect` - Side effects
- `useRouter` - Navigation
- `localStorage` - Persistent storage

## 🔧 API Integration

### API Client (`lib/api.ts`)
```typescript
import { studentsApi, authApi, attendanceApi } from '@/lib/api'

// Example usage
const students = await studentsApi.list()
const result = await authApi.login(mobile, password)
```

### Error Handling
```typescript
try {
  const result = await api.someFunction()
  if (result.success) {
    // Handle success
  } else {
    // Handle error
    setMessage({ type: 'error', text: result.error })
  }
} catch (error) {
  console.error(error)
  setMessage({ type: 'error', text: 'Operation failed' })
}
```

## 🎯 Performance Optimization

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Use Next.js Image component
- **Lazy Loading**: Implemented for xlsx library
- **Memoization**: Use React.memo for heavy components

## 🐛 Common Issues

### API Connection Errors
Check if `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
# Type check
npm run type-check
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎨 Icons

Using inline SVG icons (Heroicons style):
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>
```

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@fosterkids.com

## 📜 License

MIT License - See LICENSE file for details

---

Made with ❤️ for Foster Kids School
