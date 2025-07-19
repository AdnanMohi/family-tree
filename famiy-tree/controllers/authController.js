import { getConnection } from "../db.js";
import bcrypt from 'bcryptjs';

export async function registerController(req, res, body) {
  const { name, email, password } = body;

  if (!name || !email || !password || !email.includes('@')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'error', error: 'Invalid input' }));
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const db = await getConnection();

    await db.execute(
      'INSERT INTO family_tree.users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    console.log('User registered:', { name, email });

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', message: 'User registered' }));
  } catch (err) {
    console.error('DB error:', err);
    const errorMsg = err.code === 'ER_DUP_ENTRY' ? 'Email already registered' : 'Database error';

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: errorMsg }));
  }
}

// handle login controller
export async function loginController(req, res, body) {
  const { email, password } = body;

  try {
    const db = await getConnection();
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'error', error: 'Invalid email or password' }));
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'error', error: 'Invalid email or password' }));
    }

    // Here you would typically set a session or token
    console.log('User logged in:', { email });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', message: 'Login successful' }));
  } catch (err) {
    console.error('Login error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: 'Server error' }));
  }
}
