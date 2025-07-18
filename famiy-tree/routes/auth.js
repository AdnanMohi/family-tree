import { parseBody } from '../utils/bodyParser.js';
import { registerController } from '../controllers/authController.js';

export async function handleRegister(req, res) {
  try {
    const body = await parseBody(req);
    await registerController(req, res, body);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "error", error: "Server error" }));
  }
}
