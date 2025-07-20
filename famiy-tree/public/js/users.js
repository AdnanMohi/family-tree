export function init() {
  loadUsers();
}

export async function loadUsers() {
  try {
    const res = await fetch('/dashboard-data');
    const data = await res.json();

    if (data.status !== 'success') throw new Error(data.error);

    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';

    data.users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${new Date(user.created_at).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load users:', err);
    const tbody = document.querySelector('#users-table tbody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-red-500">⚠️ Failed to load users</td></tr>`;
    }
  }
}
