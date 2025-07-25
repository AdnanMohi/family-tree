import jwt from 'jsonwebtoken';
import { sendError, sendRedirect } from '../utils/responseHelpers.js'; 
import { getCookie } from '../utils/cookieUtils.js';

/**
 * Middleware to verify token. It intelligently handles API vs. Page requests.
 * - For APIs, it sends a JSON error on failure.
 * - For Pages, it redirects to /login on failure.
 */
export function authMiddleware(req, res, next) {
  const token = getCookie(req.headers.cookie, 'token');

  const handleAuthFailure = () => {
    // This is the new, smart logic
    if (req.url.startsWith('/api/')) {
      // It's an API request, send a JSON error
      console.log(`❌ API Auth Failed for ${req.url}. Sending 401.`);
      return sendError(res, 401, 'Authentication required.');
    } else {
      // It's a Page request, redirect to the login page
      console.log(`🚫 Page Auth Failed for ${req.url}. Redirecting to /login.`);
      return sendRedirect(res, '/login');
    }
  };

  if (!token) {
    return handleAuthFailure();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('✅ Authenticated user:', decoded.name || decoded.userId);
    next(); // Proceed to the actual route handler
  } catch (err) {
    console.log('❌ Invalid or expired token.');
    return handleAuthFailure();
  }
}


/**
 * Middleware for public-only pages.
 * If a user has a valid token, they are redirected to the dashboard.
 * If not, they are allowed to see the public page.
 */
export function redirectIfLoggedIn(req, res, next) {
  const token = getCookie(req.headers.cookie, 'token');

  if (!token) {
    // No token, user is not logged in. Proceed to the public page.
    return next();
  }

  try {
    // A token exists. Let's verify it.
    jwt.verify(token, process.env.JWT_SECRET);
    
    // If verification succeeds, the user is logged in. Redirect them.
    console.log('✅ User is already logged in. Redirecting to /dashboard.');
    return sendRedirect(res, '/dashboard');

  } catch (err) {
    // The token is invalid or expired. Treat the user as logged out.
    // It's good practice to clear the bad cookie.
    res.setHeader('Set-Cookie', 'token=; Max-Age=0');
    // Proceed to the public page.
    return next();
  }
}