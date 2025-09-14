# CORS Fix Instructions

## Problem
The frontend (`http://localhost:5173`) was experiencing CORS errors when trying to access the backend API (`http://localhost:5000/api`).

## Solution Implemented

### 1. Enhanced CORS Configuration
Updated `backend/src/server.js` with:

- **Multiple allowed origins**: Supports both `localhost:5173` (Vite default) and `localhost:3000` (React default)
- **Additional headers**: Added support for `X-Session-ID` header (required for like/share functionality)
- **Explicit preflight handling**: Added OPTIONS handler for better compatibility
- **Debug logging**: Added CORS request logging in development mode

### 2. Headers Added to CORS
- `X-Session-ID` - Required for anonymous user tracking
- `X-Requested-With` - Common AJAX header
- `Accept` - Content type negotiation
- `Origin` - Origin header support

### 3. CORS Test Endpoint
Added `/api/cors-test` endpoint to verify CORS is working correctly.

## Testing the Fix

### 1. Start Both Servers
```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
npm run dev
```

### 2. Test CORS Manually
Open browser console on `http://localhost:5173` and run:
```javascript
// Test basic API call
fetch('http://localhost:5000/api/cors-test')
  .then(res => res.json())
  .then(data => console.log('CORS Test:', data))
  .catch(err => console.error('CORS Error:', err));

// Test with session header
fetch('http://localhost:5000/api/prompts?limit=1', {
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': 'test-123'
  }
})
  .then(res => res.json())
  .then(data => console.log('Prompts API:', data))
  .catch(err => console.error('API Error:', err));
```

### 3. Automatic Testing
The CORS test utility (`src/utils/corsTest.ts`) will automatically run in development mode and log results to the console.

### 4. Verify in Explore Page
1. Navigate to `/explore` page
2. Check browser Network tab for successful API calls
3. Verify prompts are loading without CORS errors

## Troubleshooting

If CORS errors persist:

### 1. Check Backend Console
Look for CORS debug logs showing request origins and methods.

### 2. Verify Ports
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### 3. Browser Cache
Clear browser cache and cookies, then reload.

### 4. Alternative Origins
If using different ports, update CORS configuration in `backend/src/server.js`:
```javascript
origin: [
  'http://localhost:YOUR_FRONTEND_PORT',
  // ... other origins
]
```

### 5. Environment Variables
Check if `FRONTEND_URL` environment variable is set correctly.

## Common CORS Error Messages Fixed

- ❌ \"Access to fetch at 'http://localhost:5000/api/prompts' from origin 'http://localhost:5173' has been blocked by CORS policy\"
- ❌ \"CORS header 'Access-Control-Allow-Origin' missing\"
- ❌ \"Request header field X-Session-ID is not allowed by Access-Control-Allow-Headers\"

## Verification

After implementing the fix, you should see:
- ✅ Successful API calls in browser Network tab
- ✅ Prompts loading on the explore page
- ✅ Like and share functionality working
- ✅ No CORS errors in browser console

The CORS configuration now properly supports the openPrompt application's frontend-backend communication with all required headers and origins.