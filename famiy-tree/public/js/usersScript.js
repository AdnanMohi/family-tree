const USERS_API_ENDPOINT = '/api/users';

export function init() {
  loadUsers();
}

export async function loadUsers() {
  const tbody = document.querySelector('#users-table tbody');
  if (!tbody) {
    console.error('Table body for users not found!');
    return;
  }

  try {
    const res = await fetch(USERS_API_ENDPOINT);

    if (!res.ok) {
      // This will catch 404, 500, 403, etc., and jump to the catch block below.
      throw new Error(`Server responded with status: ${res.status}`);
    }

    const data = await res.json();

    // Your existing error handling logic is preserved.
    if (data.status !== 'success') {
      throw new Error(data.error || 'The API returned an error.');
    }

    // Handle case where there are no users
    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No users found.</td></tr>';
      return;
    }

    // Create all rows in memory first before touching the DOM.
    const rowsHtml = data.users.map(user => {
      // Sanitize data by creating text nodes (or using a proper sanitization library).
      // For simplicity here, we'll build a safe string.
      const id = document.createElement('td');
      id.textContent = user.id;

      const name = document.createElement('td');
      name.textContent = user.name;

      const email = document.createElement('td');
      email.textContent = user.email;

      const createdAt = document.createElement('td');
      createdAt.textContent = new Date(user.created_at).toLocaleString();
      
      return `<tr>${id.outerHTML}${name.outerHTML}${email.outerHTML}${createdAt.outerHTML}</tr>`;
    }).join('');

    // Update the DOM only once.
    tbody.innerHTML = rowsHtml;

  } catch (err) {
    console.error('Failed to load users:', err);
    // Display the specific error message to the user for better feedback.
    tbody.innerHTML = `<tr><td colspan="4" class="text-red-500 text-center py-4"> ${err.message}</td></tr>`;
  }
}
