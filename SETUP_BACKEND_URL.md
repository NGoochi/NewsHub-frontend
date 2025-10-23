# Backend URL Configuration Setup

## Quick Setup Instructions

### 1. Create `.env.local` file

Copy the `env.template` file and rename it to `.env.local`:

```bash
# Windows (PowerShell)
Copy-Item env.template .env.local

# macOS/Linux
cp env.template .env.local
```

### 2. Update the Backend URL

Open `.env.local` and replace the dummy URL with your actual Render backend URL:

```env
# Replace this:
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
BACKEND_URL=https://your-backend-url.onrender.com

# With your actual URL:
NEXT_PUBLIC_BACKEND_URL=https://newshub-api.onrender.com
BACKEND_URL=https://newshub-api.onrender.com
```

### 3. Restart the Dev Server

After creating/updating `.env.local`, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Environment Variables Explained

### `NEXT_PUBLIC_BACKEND_URL`
- Used by **client-side code** (runs in the browser)
- Used in: `src/lib/api/client.ts`, `src/lib/api/auth.ts`
- Must have `NEXT_PUBLIC_` prefix to be accessible in browser

### `BACKEND_URL`
- Used by **server-side code** (Next.js API routes)
- Used in: `src/app/api/auth/login/route.ts`
- Does NOT need `NEXT_PUBLIC_` prefix

## Local Development

For local development with backend on `localhost:8080`, use:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:8080
```

## Production Deployment

When deploying to Vercel/Netlify/etc., set these environment variables in your hosting platform's dashboard:

1. Go to your project settings
2. Find "Environment Variables" section
3. Add both variables with your production backend URL

## Troubleshooting

**Issue:** Changes not taking effect
- **Solution:** Restart the dev server after modifying `.env.local`

**Issue:** "Network error" or "Unable to connect"
- **Solution:** Verify your backend URL is correct and the backend is running

**Issue:** CORS errors
- **Solution:** Ensure your backend has CORS configured to allow requests from your frontend domain

## Files Updated

The following files now use environment variables:
- ✅ `src/lib/api/client.ts` - Main API client
- ✅ `src/lib/api/auth.ts` - Authentication API
- ✅ `src/app/api/auth/login/route.ts` - Login API route (already configured)

All files fall back to `http://localhost:8080` if environment variables are not set.

