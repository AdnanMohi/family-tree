import { getConnection } from "../db.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // For creating session tokens
import { sendJSON, sendError } from '../utils/responseHelpers.js'; // Import our new helpers

/// Handles user registration, including input validation, password hashing, and database insertion.
export async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password || !email.includes('@')) {
      return sendError(res, 400, 'Invalid input: name, email, and a valid password are required.');
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const db = await getConnection();
    await db.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    console.log('User registered:', { name, email });

    // Send a standardized success response
    sendJSON(res, 201, { message: 'User registered successfully.' });

  } catch (err) {
    console.error('❌ DB error during registration:', err);

    // Handle specific, expected errors
    if (err.code === 'ER_DUP_ENTRY') {
      return sendError(res, 409, 'An account with this email already exists.'); // 409 Conflict is more appropriate
    }
    // Fallback for all other unexpected errors
    sendError(res, 500, 'An internal error occurred during registration.');
  }
}

// Handles user login, including input validation, password verification, and session management.
export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    //  Validate input
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required.');
    }

    // Find the user in the database
    const db = await getConnection();
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return sendError(res, 401, 'Invalid credentials.'); // Use a generic message for security
    }

    const user = rows[0];

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, 'Invalid credentials.');
    }

    // Create a JWT (JSON Web Token) for the session
    const token = jwt.sign(
      { userId: user.id, name: user.name }, // Payload: Data to store in the token
      process.env.JWT_SECRET, // Secret key for signing the token
      { expiresIn: '1h' } // Token expiration time
    );
    console.log('JWT created:', token);

    // Set the token in a secure, HttpOnly cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`);

    console.log('User logged in:', { email });
    sendJSON(res, 200, { message: 'Login successful.' });

  } catch (err) {
    console.error('Login error:', err);
    sendError(res, 500, 'An internal error occurred during login.');
  }
}

// Handles user logout by clearing the session cookie.

export function logoutController(req, res) {
  // Clear the cookie by setting its expiration date to a time in the past
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  sendJSON(res, 200, { message: 'Logged out successfully.' });
}
