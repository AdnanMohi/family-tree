import 'dotenv/config';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { routes } from './routes/index.js';
import { parseBody } from './utils/bodyParser.js';
import { authMiddleware, redirectIfLoggedIn } from './middleware/auth.js';
import { sendError, sendSuccess, sendRedirect } from './utils/responseHelpers.js';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

// Dispatcher for serving HTML pages
export function servePage(htmlFilename) {
  return async (req, res) => {
    try {
      const filePath = path.join(publicDir, htmlFilename);
      const html = await fs.readFile(filePath);
      // It's good practice to send no-cache headers for all HTML pages
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(html);
    } catch (err) {
      console.error(`Failed to load page: ${htmlFilename}`, err);
      sendError(res, 500, 'Could not load page');
    }
  };
}

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

  try {
    const routeKey = `${req.method} ${req.url}`;
    const matchedRoute = routes[routeKey];

    // HANDLE API & PAGE ROUTES
    // This block handles every endpoint defined in your routes/index.js file.
    if (matchedRoute) {
      const { protected: isProtected = false, publicOnly, handler } = matchedRoute;

      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        req.body = await parseBody(req);
      }

      // If the route is protected, we need to check authentication.
      if (isProtected) {
        return authMiddleware(req, res, () => handler(req, res));
      } else if (publicOnly) {
        return redirectIfLoggedIn(req, res, () => handler(req, res));
      } else {
        return handler(req, res); // Truly public routes
      }
    }

    // HANDLE STATIC ASSETS (CSS, JS, Images)
    // If the request was not a defined route, it must be a static file.
    let filePath = path.join(publicDir, req.url);

    // Safety check to prevent accessing files outside the public directory
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

    // Serve the file using the success helper
    return sendSuccess(res, fileContent, contentType);

  } catch (error) {
    if (error.code === 'ENOENT') {
      return sendError(res, 404, 'Not Found');
    }
    console.error(`Unhandled server error for ${req.method} ${req.url}:`, error);
    if (!res.headersSent) {
      sendError(res, 500, 'Internal Server Error');
    }
  }
});

// --- Start the Server ---
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
