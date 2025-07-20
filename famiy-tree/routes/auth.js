import { parseBody } from '../utils/bodyParser.js';
import { registerController } from '../controllers/authController.js';
import { loginController } from '../controllers/authController.js';

export async function handleRegister(req, res) {
  try {
    const body = await parseBody(req);
    await registerController(req, res, body);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", error: "Server error" }));
  }
}

// handle login
export async function handleLogin(req, res) {
  try {
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email || !password) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "error", error: "Invalid input" }));
    }

    await loginController(req, res, body);  // sends response itself
  } catch (err) {
    console.error('Login error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "error", error: "Server error" }));
    }
  }
}

// handle logout
export async function handleLogout(req, res) {
  try {
    // In a real app, you would clear the session or token here
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "success", message: "Logged out successfully" }));
  } catch (err) {
    console.error('Logout error:', err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", error: "Server error" }));
  }
}


