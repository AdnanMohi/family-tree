import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { routes } from './routes/index.js';
import { parseBody } from './utils/bodyParser.js';

// --- Configuration & Caching (No changes here) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const frontendRoutes = ['/', '/users', '/settings', '/profile', '/dashboard'];
const staticFileCache = new Map();
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// Server Initialization
const server = http.createServer(async (req, res) => {
  console.log(`🧭 ${req.method} ${req.url}`);

  // Main Request Handling
  try {
    const routeKey = `${req.method} ${req.url}`;
    const routeHandler = routes[routeKey];

    if (routeHandler) {
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        try {
          req.body = await parseBody(req);
        } catch (error) {
          // This nested try...catch handles only body parsing errors
          return sendError(res, 400, 'Bad Request or Invalid JSON');
        }
      }
      return await routeHandler(req, res); // API call handled, exit.
    }

    // Static File Handling ---
    if (frontendRoutes.includes(req.url)) {
      filePath = path.join(publicDir, 'index.html');
    } else {
      let resourcePath = req.url === '/' ? 'index.html' : req.url;
      if (!path.extname(resourcePath)) {
        resourcePath += '.html';
      }
      filePath = path.join(publicDir, resourcePath);
    }

    // Safety check: Ensure the file path is within the public directory.
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(publicDir)) {
      return sendError(res, 403, 'Access Denied');
    }

    // Check the cache before reading from disk.
    if (staticFileCache.has(normalizedPath)) {
      const { content, mime } = staticFileCache.get(normalizedPath);
      return sendSuccess(res, content, mime);
    }

    // This is the CORE of the conversion
    const fileContent = await fs.readFile(normalizedPath);

    // Determine the MIME type based on the file extension.
    const ext = path.extname(normalizedPath);
    const contentType = mimeTypes[ext] || 'text/plain';

    // Add the newly read file to the cache.
    staticFileCache.set(normalizedPath, { content: fileContent, mime: contentType });

    // Use the sendSuccess helper.
    sendSuccess(res, fileContent, contentType);

  } catch (error) {
    // Handle file not found errors gracefully.
    if (error.code === 'ENOENT') {
      return sendError(res, 404, 'Not Found', 'text/plain');
    }

    // Handle errors from API handlers or other unexpected issues.
    console.error(`Unhandled server error for ${req.method} ${req.url}:`, error);
    if (!res.headersSent) { // Check if a response has already started
      sendError(res, 500, 'Internal Server Error', 'text/plain');
    }
  }
});

// For sending success responses
function sendSuccess(res, content, contentType) {
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400',
  });
  res.end(content);
}

// For sending error responses
function sendError(res, statusCode, message, contentType = 'application/json') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  const errorPayload = contentType === 'application/json'
    ? JSON.stringify({ error: message })
    : message;
  res.end(errorPayload);
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
