# Authentication System

## Overview

NewsHub uses JWT-based authentication with cookie storage and Bearer token headers.

## Architecture

### Authentication Flow

1. User enters password on `/login` page
2. Frontend calls Next.js API route `/api/auth/login`
3. API route proxies request to backend `POST /auth/login`
4. Backend validates password and returns JWT token
5. API route sets token as cookie (not httpOnly, so client can read it)
6. Client redirects to dashboard
7. Axios interceptor reads token from cookie and attaches to Authorization header
8. All subsequent API calls include `Authorization: Bearer <token>` header

### Components

#### Auth Context (`src/contexts/AuthContext.tsx`)
- Provides authentication state across the app
- Methods: `login()`, `logout()`, `checkAuth()`
- State: `user`, `isLoading`, `isAuthenticated`

#### Protected Route (`src/components/auth/ProtectedRoute.tsx`)
- Wraps protected pages
- Redirects to `/login` if not authenticated
- Shows loading state during auth check

#### Login Page (`src/app/login/page.tsx`)
- Simple password input form
- Error handling and loading states
- Auto-redirect after successful login

#### API Routes
- `/api/auth/login` - Proxies login to backend and sets JWT token cookie
- `/api/auth/logout` - Clears authentication cookie

### Token Management

**Storage:** Browser cookies (readable by JavaScript)
**Lifetime:** 24 hours  
**Renewal:** Manual re-login required after expiration
**Format:** Stored in cookie, sent as `Bearer` token in Authorization header

**Note:** While httpOnly cookies would provide additional security against XSS attacks, we use regular cookies because the backend expects the JWT token in the `Authorization` header. The cookie is still protected by `sameSite: lax` and `secure` flag in production.

### API Client Integration

The axios client (`src/lib/api/client.ts`) automatically:
1. Reads JWT token from `authToken` cookie
2. Attaches token to `Authorization: Bearer <token>` header on all requests
3. Handles 401/403 responses by clearing token and redirecting to login
4. Applies to both `apiClient` and `analysisApiClient`

## Protected Routes

All main pages are protected:
- `/` (Dashboard)
- `/project/[id]` (Project Page)
- `/categories` (Categories)
- `/settings` (Settings)

## Usage

### Protecting a New Page

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Using Auth Context

```tsx
import { useAuthContext } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, user!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Environment Variables

Set in Next.js API routes:
- `BACKEND_URL` - Backend API base URL (default: `http://localhost:8080`)

## Security Features

1. **Cookie Storage** - Token stored in browser cookies with protection flags
2. **Automatic Token Injection** - Axios interceptor handles Authorization header
3. **401/403 Handling** - Automatic redirect to login on auth failures
4. **SameSite Protection** - CSRF protection via `sameSite: lax` cookie setting
5. **Secure in Production** - `secure` flag enabled for HTTPS environments

## Development

To test authentication:
1. Start backend server with valid password configured
2. Start frontend: `npm run dev`
3. Navigate to `http://localhost:9090`
4. Should redirect to `/login`
5. Enter backend password
6. Should redirect to dashboard with authentication

## Troubleshooting

**Issue:** Stuck in redirect loop
- Check that backend is running and accessible
- Verify backend password is correct
- Check browser console for errors

**Issue:** Token not being sent
- Verify cookies are enabled in browser
- Check Network tab for `authToken` cookie
- Ensure `withCredentials: true` in axios config

**Issue:** 401 errors on every request
- Backend may not be accepting the token
- Check backend JWT secret matches
- Verify token expiration hasn't passed

