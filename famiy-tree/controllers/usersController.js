import { getConnection } from "../db.js";
import { sendJSON, sendError } from "../utils/responseHelpers.js";

// --- READ (All) ---
export async function getAllUsers(req, res) {
  try {
    const db = await getConnection();
    const [users] = await db.execute(
      "SELECT id, name, email, created_at FROM users"
    );
    if (users.length === 0) {
      return sendJSON(res, 200, { users: [] }); // Return an empty array if no users found
    }
    sendJSON(res, 200, { users: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    sendError(res, 500, "Could not fetch users");
  }
}

// --- CREATE ---
export async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return sendError(res, 400, "Name, email, and password are required.");
    }

    const db = await getConnection();
    await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password] // Password should be hashed in a real application
    );

    // Send a standardized success response
    sendJSON(res, 201, { message: "User created successfully." });
  } catch (err) {
    console.error("Error creating user:", err);
    sendError(res, 500, "Could not create user.");
  }
}

// --- READ (One) ---
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const db = await getConnection();
    const [rows] = await db.execute(
      "SELECT id, name, email FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return sendError(res, 404, "User not found.");
    }
    // Send the user data as a JSON response
    sendJSON(res, 200, rows[0]);
  } catch (err) {
    console.error(`Error fetching user ${req.params.id}:`, err);
    sendError(res, 500, "Could not fetch user.");
  }
}

// --- UPDATE ---
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return sendError(res, 400, "Name and email are required.");
    }

    const db = await getConnection();
    await db.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [
      name,
      email,
      id,
    ]);

    // Send a standardized success response
    sendJSON(res, 200, { message: `User ${id} updated successfully.` });
  } catch (err) {
    console.error(`Error updating user ${req.params.id}:`, err);
    sendError(res, 500, "Could not update user.");
  }
}

// --- DELETE ---
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const db = await getConnection();
    await db.execute("DELETE FROM users WHERE id = ?", [id]);

    // Send a standardized success response
    res.writeHead(204);
    res.end();
  } catch (err) {
    console.error(`Error deleting user ${req.params.id}:`, err);
    sendError(res, 500, "Could not delete user.");
  }
}
