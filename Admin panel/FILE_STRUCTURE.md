# Admin Panel - File Structure

## Project Structure

```
Admin panel/
├── public/
│   ├── sertifikat.png
│   └── vite.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout/         # Layout components
│   │   │   ├── Header.jsx  # Top navigation header
│   │   │   ├── Layout.jsx  # Main layout wrapper
│   │   │   └── Sidebar.jsx # Side navigation menu
│   │   └── ProtectedRoute.jsx  # Route protection component
│   │
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication state management
│   │
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Dashboard.jsx   # Dashboard page
│   │   └── Admins.jsx      # All admins list (SuperAdmin only)
│   │
│   ├── services/           # API services
│   │   ├── api.js          # Axios instance & interceptors
│   │   └── authService.js  # Authentication API calls
│   │
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Component Hierarchy

```
App.jsx
├── AuthProvider (Context)
│   └── Router
│       ├── /login → Login.jsx
│       ├── /dashboard → ProtectedRoute → Layout → Dashboard.jsx
│       └── /admins → ProtectedRoute (SuperAdmin) → Layout → Admins.jsx
│
Layout.jsx
├── Sidebar.jsx
├── Header.jsx
└── {children} (Page content)
```

## Features

### 1. Authentication System
- **Login Page**: Email/password authentication
- **Auth Context**: Global authentication state
- **Token Management**: JWT token stored in localStorage
- **Auto-logout**: On 401 errors

### 2. Protected Routes
- **ProtectedRoute**: Requires authentication
- **SuperAdmin Protection**: Additional check for SuperAdmin routes
- **Loading States**: Shows spinner while checking auth

### 3. Layout Components
- **Sidebar**: 
  - Navigation menu
  - Shows different items based on admin type
  - Responsive (hidden on mobile)
- **Header**: 
  - User profile dropdown
  - Logout functionality
  - Mobile menu toggle

### 4. Pages
- **Login**: Authentication form
- **Dashboard**: Admin information overview
- **Admins**: List of all admins (SuperAdmin only)

### 5. API Services
- **api.js**: 
  - Axios instance with base URL
  - Request interceptor (adds token)
  - Response interceptor (handles 401)
- **authService.js**: 
  - Login
  - Get current admin
  - Get all admins
  - Health check

## API Integration

### Base URL
```
http://localhost:5000/api
```

### Endpoints Used
- `POST /admin/login` - Login
- `GET /admin/me` - Get current admin
- `GET /admin` - Get all admins (SuperAdmin only)
- `GET /health` - Health check

## State Management

### AuthContext
- `admin`: Current admin object
- `loading`: Loading state
- `isAuthenticated`: Auth status
- `login(email, password)`: Login function
- `logout()`: Logout function
- `isSuperAdmin()`: Check if current admin is SuperAdmin

## Routing

- `/` → Redirects to `/dashboard`
- `/login` → Login page (public)
- `/dashboard` → Dashboard (protected)
- `/admins` → Admins list (protected, SuperAdmin only)

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Custom Styles**: Global styles in `index.css`

## Dependencies

### Production
- `react` & `react-dom`: React framework
- `react-router-dom`: Routing
- `axios`: HTTP client
- `framer-motion`: Animations (available)
- `jspdf`: PDF generation (available)
- `qrcode`: QR code generation (available)

### Development
- `vite`: Build tool
- `tailwindcss`: CSS framework
- `eslint`: Linting

## Usage

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Build for Production**:
   ```bash
   npm run build
   ```

3. **Default Login Credentials**:
   - Email: `general@admin.com`
   - Password: `admin123`

## Security Features

- JWT token authentication
- Protected routes
- Role-based access control (SuperAdmin vs General)
- Auto-logout on unauthorized access
- Token stored securely in localStorage
