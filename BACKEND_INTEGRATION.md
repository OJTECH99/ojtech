# Frontend-Backend Integration Guide

## ✅ **Integration Complete!**

The FiliUp frontend has been successfully integrated with the backend API.

---

## 📋 **Changes Made**

### 1. **API Service Layer Created** (`src/lib/api.ts`)
- ✅ Axios instance with base URL configuration
- ✅ Request interceptor for JWT token
- ✅ Response interceptor for 401 handling
- ✅ TypeScript interfaces for all API types
- ✅ Organized API functions by role:
  - `authAPI` - Login, Register
  - `adminAPI` - User management, stats
  - `teacherAPI` - Section management
  - `studentAPI` - Lessons, activities, progress

### 2. **AuthContext Updated** (`src/contexts/AuthContext.tsx`)
- ✅ Integrated with backend login API
- ✅ JWT token storage in localStorage
- ✅ Automatic token injection in requests
- ✅ User persistence across page refreshes
- ✅ Student section registration via API
- ✅ Proper error handling with backend messages

### 3. **Environment Configuration** (`.env`)
- ✅ Backend API URL: `http://localhost:8080/api`
- ✅ Configurable via environment variable

---

## 🚀 **How to Use**

### **Prerequisites**
1. Backend server running on `http://localhost:8080`
2. PostgreSQL database set up
3. Frontend dependencies installed

### **Installation**
```bash
cd Frontend
npm install axios
npm run dev
```

### **Backend Setup**
```bash
cd Backend
./mvnw spring-boot:run
```

---

## 🔑 **Authentication Flow**

### **Login Process:**
1. User enters email/password
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token + user data
5. Frontend stores token in localStorage
6. Token automatically added to all subsequent requests

### **Token Storage:**
```typescript
localStorage.setItem('token', response.token);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

### **Protected Requests:**
All API calls automatically include:
```
Authorization: Bearer <token>
```

---

## 📡 **API Integration Examples**

### **Login**
```typescript
import { authAPI } from '@/lib/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authAPI.login({ email, password });
    // Token stored automatically
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### **Create Section (Teacher)**
```typescript
import { teacherAPI } from '@/lib/api';

const handleCreateSection = async () => {
  try {
    const section = await teacherAPI.createSection({
      name: 'Grade 1 - Section A',
      gradeLevel: 'Grade 1',
      capacity: 30
    });
    console.log('Section created:', section.inviteCode);
  } catch (error) {
    console.error('Failed:', error);
  }
};
```

### **Submit Activity (Student)**
```typescript
import { studentAPI } from '@/lib/api';

const handleSubmit = async (activityId: string, answers: any[]) => {
  try {
    const result = await studentAPI.submitActivity(activityId, {
      answers,
      timeSpentSeconds: 120
    });
    console.log('Score:', result.percentage);
  } catch (error) {
    console.error('Submission failed:', error);
  }
};
```

---

## 🔄 **API Mappings**

### **User Roles**
- Backend: `ADMIN`, `TEACHER`, `STUDENT` (uppercase)
- Frontend: `'admin'`, `'teacher'`, `'student'` (lowercase)
- **Mapping handled automatically in AuthContext**

### **User Object Structure**

**Backend Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "STUDENT",
  "sectionId": "uuid",
  "isActive": true
}
```

**Frontend User:**
```typescript
{
  id: "uuid",
  name: "John Doe",  // mapped from fullName
  email: "user@example.com",
  role: "student",   // lowercase
  sectionId: "uuid",
  isNewStudent: false,
  progress: { ... }
}
```

---

## 🛠️ **Next Steps for Full Integration**

### **Components to Update:**

#### 1. **TeacherDashboard** (`src/components/TeacherDashboard.tsx`)
```typescript
import { teacherAPI } from '@/lib/api';

useEffect(() => {
  const fetchSections = async () => {
    const sections = await teacherAPI.getSections();
    setSections(sections);
  };
  fetchSections();
}, []);
```

#### 2. **StudentDashboard** (`src/components/StudentDashboard.tsx`)
```typescript
import { studentAPI } from '@/lib/api';

useEffect(() => {
  const fetchLessons = async () => {
    const lessons = await studentAPI.getLessons();
    setLessons(lessons);
  };
  fetchLessons();
}, []);
```

#### 3. **AdminDashboard** (`src/components/AdminDashboard.tsx`)
```typescript
import { adminAPI } from '@/lib/api';

useEffect(() => {
  const fetchStats = async () => {
    const stats = await adminAPI.getStats();
    setStats(stats);
  };
  fetchStats();
}, []);
```

---

## 🔐 **Security Features**

### **Implemented:**
- ✅ JWT token authentication
- ✅ Automatic token injection
- ✅ Token stored in localStorage
- ✅ Automatic logout on 401 (token expired)
- ✅ CORS configured for `localhost:5173`

### **Token Expiration:**
- Access token: 24 hours
- Refresh token: 7 days
- Auto-logout on expiration

---

## ⚠️ **Error Handling**

### **API Error Structure:**
```typescript
try {
  await api.post('/endpoint', data);
} catch (error: any) {
  // Error from backend
  const message = error.response?.data?.message || 'An error occurred';
  const status = error.response?.status;
  
  console.error(`Error ${status}: ${message}`);
}
```

### **Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (login required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## 📊 **Testing the Integration**

### **1. Test Login**
```bash
# Ensure backend is running
cd Backend
./mvnw spring-boot:run

# In another terminal, start frontend
cd Frontend
npm run dev
```

### **2. Create Test Users**

**Register Admin:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@filipino.edu",
    "password": "admin123",
    "fullName": "Admin User",
    "role": "ADMIN"
  }'
```

**Register Teacher:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@filipino.edu",
    "password": "teacher123",
    "fullName": "Teacher Maria",
    "role": "TEACHER"
  }'
```

**Register Student:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@filipino.edu",
    "password": "student123",
    "fullName": "Juan Dela Cruz",
    "role": "STUDENT"
  }'
```

### **3. Login via Frontend**
1. Open `http://localhost:5173`
2. Click "Get Started"
3. Enter credentials (e.g., `admin@filipino.edu` / `admin123`)
4. You should be redirected to the appropriate dashboard

---

## 🎯 **API Endpoints Used**

### **Authentication (Public)**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### **Admin (ROLE_ADMIN)**
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

### **Teacher (ROLE_TEACHER)**
- `GET /api/teacher/sections` - List sections
- `POST /api/teacher/sections` - Create section
- `GET /api/teacher/sections/{id}` - Section details

### **Student (ROLE_STUDENT)**
- `POST /api/student/register-section` - Join section
- `GET /api/student/lessons` - List lessons
- `GET /api/student/lessons/{id}` - Lesson content
- `POST /api/student/lessons/{id}/complete` - Complete lesson
- `GET /api/student/activities/{id}` - Activity content
- `POST /api/student/activities/{id}/submit` - Submit activity

---

## 🐛 **Troubleshooting**

### **CORS Error**
If you see CORS errors in browser console:
1. Check backend is running on port 8080
2. Verify `SecurityConfig.java` includes frontend URL
3. Current CORS allows: `http://localhost:5173`, `http://localhost:3000`

### **401 Unauthorized**
- Check if backend is running
- Verify token is stored: `localStorage.getItem('token')`
- Token may be expired (24 hours)
- Try logging in again

### **Network Error**
- Backend not running
- Wrong API URL in `.env`
- Check: `VITE_API_BASE_URL=http://localhost:8080/api`

### **Token Not Sent**
- Verify axios interceptor in `api.ts`
- Check browser DevTools > Network > Headers
- Should see: `Authorization: Bearer <token>`

---

## 📈 **Current Integration Status**

### **✅ Completed:**
- Authentication (Login/Register)
- JWT token management
- User persistence
- Student section registration
- API service layer
- Error handling
- Auto-logout on token expiration

### **🔄 Next Steps (Optional):**
- Update TeacherDashboard to fetch real sections
- Update StudentDashboard to fetch real lessons
- Update AdminDashboard to fetch real stats
- Implement activity submission with real API
- Add loading states for API calls
- Add toast notifications for errors
- Implement token refresh logic

---

## 💡 **Best Practices**

1. **Always use the API service layer** (`@/lib/api`) - Don't create axios instances elsewhere
2. **Handle errors gracefully** - Show user-friendly messages
3. **Add loading states** - Improve UX during API calls
4. **Type safety** - Use TypeScript interfaces from `api.ts`
5. **Token security** - Never expose tokens in logs or console

---

## 📚 **Documentation References**

- **Backend API Docs**: `/Backend/COMPLETE_API_REFERENCE.md`
- **Backend Quick Ref**: `/Backend/QUICK_REFERENCE.md`
- **Database Schema**: `/Backend/docs/SCHEMA.md`
- **Getting Started**: `/Backend/GETTING_STARTED.md`

---

**Integration is ready! The frontend now communicates with the real backend API.** 🎉

Test the login flow and verify API calls in browser DevTools Network tab.
