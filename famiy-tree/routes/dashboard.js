import { dashboardController } from '../controllers/dashboardController.js';

export async function GetAllUsers(req, res) {
  try {
    await dashboardController(req, res);
  } catch (err) {
    console.error('Dashboard route error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: 'Server error' }));
  }
}
