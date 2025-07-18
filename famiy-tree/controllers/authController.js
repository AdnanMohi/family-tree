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
