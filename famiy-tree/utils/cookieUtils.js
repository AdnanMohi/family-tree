export function getCookie(cookieHeader, key) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [k, v] = cookie.split('=');
    if (k === key) return decodeURIComponent(v);
  }
  return null;
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    cookies[name] = decodeURIComponent(rest.join('='));
  });

  return cookies;
}
