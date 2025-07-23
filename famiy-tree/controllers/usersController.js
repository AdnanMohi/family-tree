import { getConnection } from "../db.js";

export async function getAllUsers(req, res) {
  try {
    const db = await getConnection();
    const [users] = await db.execute('SELECT id, name, email, created_at FROM users');
    console.log('Fetched users:', users); // Debugging line to check fetched users
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', users }));
  } catch (err) {
    console.error('Error fetching users:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: 'Could not fetch users' }));
  }
}