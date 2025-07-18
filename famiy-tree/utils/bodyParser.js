export function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve(Object.fromEntries(new URLSearchParams(body)));
      }
    });
    req.on('error', reject);
  });
}
