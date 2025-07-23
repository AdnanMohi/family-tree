
/**
 * Sends a standardized JSON success response.
 * @param {http.ServerResponse} res The response object.
 * @param {number} statusCode The HTTP status code.
 * @param {object} data The data payload to send.
 */
export function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', ...data }));
}

/**
 * Sends a standardized JSON error response.
 * @param {http.ServerResponse} res The response object.
 * @param {number} statusCode The HTTP status code.
 * @param {string} message The error message.
 */
export function sendError(res, statusCode, message) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', error: message }));
}
