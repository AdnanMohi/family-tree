export function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', ...data }));
}

export function sendSuccess(res, content, contentType) {
  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=86400',
  });
  res.end(content);
}

export function sendError(res, statusCode, message, contentType = 'application/json') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  const errorPayload = contentType === 'application/json'
    ? JSON.stringify({ error: message })
    : message;
  res.end(errorPayload);
}

export function sendRedirect(res, location) {
  res.writeHead(302, { 'Location': location });
  res.end();
}
