import { showToast } from '../components/toast.js';

const USERS_API_ENDPOINT = '/api/users';
const REGISTER_API_ENDPOINT = '/api/users/register';

// --- MAIN INITIALIZATION ---
export function init() {
  loadUsers();

  document.querySelector('#users-table-body').addEventListener('click', handleTableClick);
  document.querySelector('#submit-add-user-button').addEventListener('click', handleAddUser);
  document.querySelector('#edit-user-form').addEventListener('submit', handleSaveChanges);
  document.querySelector('#add-user-button').addEventListener('click', handleAddUserClick);
  document.querySelector('#confirm-delete-button').addEventListener('click', handleConfirmDelete);

  // Cancel buttons for modals
  document.querySelector('#cancel-add-button').addEventListener('click', () => closeModal('#add-user-modal'));
  document.querySelector('#cancel-edit-button').addEventListener('click', () => closeModal('#edit-user-modal'));
  document.querySelector('#cancel-delete-button').addEventListener('click', () => closeModal('#delete-user-modal'));
}

// User rendering function
function renderUsers(users) {
  const tbody = document.querySelector('#users-table-body');
  if (!tbody) {
    console.error('Table body for users (#users-table-body) not found!');
    return;
  }

  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">No users found.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(user => {
    const registeredDate = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    return `
      <tr class="hover:bg-gray-50 transition-colors duration-150">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${user.name}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${user.email}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${registeredDate}</td>
       
        <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
          <button data-action="edit" data-userid="${user.id}" class="text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
          <button data-action="delete" data-userid="${user.id}" class="text-red-600 hover:text-red-800 ml-4 transition-colors">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Render an error message in the table
function renderError(message) {
  const tbody = document.querySelector('#users-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-red-500 text-center py-4">Error: ${message}</td></tr>`;
  }
}

// --- LOAD USERS FROM API ---
export async function loadUsers() {
  const tbody = document.querySelector('#users-table-body');
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading users...</td></tr>`;
  }

  try {
    const res = await fetch(USERS_API_ENDPOINT);
    if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);
    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.error || 'API returned an error.');
    renderUsers(data.users);
  } catch (error) {
    console.error('Error loading users:', error);
    renderError(error.message);
  }
}

// Add user button click handler
function handleAddUserClick() {
  document.querySelector('#add-user-modal').classList.remove('hidden');
  document.querySelector('#add-user-form').reset(); // Reset the form
}

// Add new user
async function handleAddUser(event) {
  event.preventDefault();
  const name = document.querySelector('#add-user-name').value;
  const email = document.querySelector('#add-user-email').value;
  const password = document.querySelector('#add-user-password').value;

  try {
    // Validate input
    if (!name || !email || !password) {
      showToast('❌ Name and email are required.', 'error');
      return;
    }

    const res = await fetch(REGISTER_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) throw new Error('Failed to add user.');
    closeModal('#add-user-modal'); // Close the modal
    showToast('✅ User added successfully!', 'success');
    loadUsers(); // Refresh the list
  } catch (error) {
    console.error(error);
    showToast('❌ Failed to add user.', 'error');
  }
}

// This function handles clicks on the user table.
async function handleTableClick(event) {
  const target = event.target;
  const action = target.dataset.action;
  const userId = target.dataset.userid;

  if (!action || !userId) return; // Ignore clicks that aren't on our action buttons.

  if (action === 'edit') {
    try {
      const res = await fetch(`${USERS_API_ENDPOINT}/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user details.');
      const data = await res.json();

      document.querySelector('#edit-user-id').value = data.id;
      document.querySelector('#edit-user-name').value = data.name;
      document.querySelector('#edit-user-email').value = data.email;
      document.querySelector('#edit-user-modal').classList.remove('hidden');

      // Store the original values on the form's dataset for comparison later
      const editForm = document.querySelector('#edit-user-form');
      editForm.dataset.originalName = data.name;
      editForm.dataset.originalEmail = data.email;

    } catch (error) {
      console.error(error);
      showToast('❌ Could not load user data.', 'error');
    }
  }

  if (action === 'delete') {
    try {
      const res = await fetch(`${USERS_API_ENDPOINT}/${userId}`);
      if (!res.ok) throw new Error('Could not fetch user details for confirmation.');
      const user = await res.json();

      const confirmText = document.querySelector('#delete-confirmation-text');
      const confirmButton = document.querySelector('#confirm-delete-button');
      confirmText.textContent = `Are you sure you want to permanently delete ${user.name}? This action cannot be undone.`;
      confirmButton.dataset.userid = user.id; // Store the ID on the button
      document.querySelector('#delete-user-modal').classList.remove('hidden');
    } catch (error) {
      console.error(error);
      showToast('❌ Could not get user details.', 'error');
    }
  }
}

// Confirm delete user
async function handleConfirmDelete() {
  const confirmButton = document.querySelector('#confirm-delete-button');
  const userId = confirmButton.dataset.userid;
  if (!userId) return;

  try {
    const res = await fetch(`${USERS_API_ENDPOINT}/${userId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user.');
    closeModal('#delete-user-modal'); // Close the modal
    showToast('✅ User deleted successfully!', 'success');
    loadUsers(); // Refresh the list
  } catch (error) {
    console.error(error);
    showToast('❌ Failed to delete user.', 'error');
  }
}

// Update user details
async function handleSaveChanges(event) {
  event.preventDefault();
  const editForm = document.querySelector('#edit-user-form');
  const userId = document.querySelector('#edit-user-id').value;
  const name = document.querySelector('#edit-user-name').value;
  const email = document.querySelector('#edit-user-email').value;

  try {
    // Validate input
    if (!name || !email) {
      showToast('❌ Name and email are required.', 'error');
      return;
    }

    // if there is no change, just close the modal
    const originalName = editForm.dataset.originalName;
    const originalEmail = editForm.dataset.originalEmail;

    if (name === originalName && email === originalEmail) {
      handleCancelEdit();
      return;
    }

    const res = await fetch(`${USERS_API_ENDPOINT}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) throw new Error('Failed to save changes.');
    closeModal('#edit-user-modal'); // Close the modal
    showToast('✅ User updated successfully!', 'success');
    document.querySelector('#edit-user-form').reset();
    loadUsers();
  } catch (error) {
    console.error(error);
    showToast('❌ Failed to update user.', 'error');
  }
}

// Close modal utility function
function closeModal(selector) {
  const modal = document.querySelector(selector);
  if (modal) {
    modal.classList.add('hidden');
  }
}
