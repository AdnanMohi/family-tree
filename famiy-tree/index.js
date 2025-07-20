import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { routes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

const frontendRoutes = ['/users', '/settings', '/profile', '/dashboard'];

const server = http.createServer((req, res) => {
  console.log(`🧭 ${req.method} ${req.url}`);

  // Route handling
  const routeKey = `${req.method} ${req.url}`;
  const routeHandler = routes[routeKey];

  if (routeHandler) {
    return routeHandler(req, res);
  }

  // Determine the file to serve
  let filePath;
  if (req.url === '/' || frontendRoutes.includes(req.url)) {
    filePath = path.join(publicDir, 'index.html');
  } else {
    filePath = path.join(publicDir, req.url === '/' ? 'index.html' : req.url);
    if (!path.extname(filePath)) {
      filePath += '.html';
    }
  }

  // Normalize and secure path
  filePath = path.normalize(filePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  // Read and serve the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback: serve index.html for SPA routes only
      if (frontendRoutes.includes(req.url)) {
        const fallbackPath = path.join(publicDir, 'index.html');
        fs.readFile(fallbackPath, (indexErr, indexData) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 - Not Found');
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          return res.end(indexData);
        });
        return;
      }

      // Otherwise, true file not found
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 - Not Found');
    }

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
