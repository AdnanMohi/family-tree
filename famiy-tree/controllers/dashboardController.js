import { getConnection } from "../db.js";

export async function dashboardController(req, res) {
  try {
    const db = await getConnection();
    const [users] = await db.execute('SELECT id, name, email, created_at FROM users');
    // You can return as HTML or JSON
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', users }));
  } catch (err) {
    console.error('Dashboard error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: 'Could not load users' }));
  }
}