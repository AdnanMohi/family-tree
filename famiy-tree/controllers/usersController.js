import { getConnection } from "../db.js";
import { sendJSON, sendError } from "../utils/responseHelpers.js";

// --- READ (All) ---
export async function getAllUsers(req, res) {
  try {
    const db = await getConnection();

    // Parse query parameters for pagination, search, and sorting
    const url = new URL(req.url, `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const searchTerm = url.searchParams.get('search') || '';

    // Default sorting parameters
    const sortBy = url.searchParams.get('sortBy') || 'name';
    const sortOrder = url.searchParams.get('sortOrder') || 'asc';

    // Pagination parameters
    const requestedLimit = parseInt(url.searchParams.get('limit')) || 10;
    const limit = Math.min(requestedLimit, 100);

    const offset = (page - 1) * limit;

    // Validate pagination parameters
    const allowedSortColumns = ['name', 'email', 'created_at'];
    if (!allowedSortColumns.includes(sortBy)) {
      return sendError(res, 400, 'Invalid sort column.');
    }
    const safeSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Build the WHERE clause for search functionality
    let whereClause = '';
    let params = [];
    if (searchTerm) {
      whereClause = 'WHERE name LIKE ? OR email LIKE ?';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    // Get the total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countRows] = await db.execute(countQuery, params);
    const totalUsers = countRows[0].total;
    const totalPages = Math.ceil(totalUsers / limit);

    // Build the final data query
    const dataQuery = `
      SELECT id, name, email, created_at FROM users 
      ${whereClause} 
      ORDER BY ${sortBy} ${safeSortOrder} 
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Execute the query and send the comprehensive response
    const [users] = await db.execute(dataQuery, params);
    sendJSON(res, 200, {
      users: users,
      pagination: {
        page: page,
        limit: limit,
        totalUsers: totalUsers,
        totalPages: totalPages
      }
    });
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
