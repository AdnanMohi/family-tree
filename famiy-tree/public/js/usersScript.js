import { showToast } from '../components/toast.js';

const USERS_API_ENDPOINT = '/api/users';
const REGISTER_API_ENDPOINT = '/api/users/register';

// --- STATE MANAGEMENT ---
let state = {
  page: 1,
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  limit: 10
};

// --- MAIN INITIALIZATION ---
export function init() {
  loadUsers();
  // Attach event listeners for pagination, sorting, and search
  document.querySelector('#limit-select').addEventListener('change', handleLimitChange);
  document.querySelector('#prev-button').addEventListener('click', () => changePage(-1));
  document.querySelector('#next-button').addEventListener('click', () => changePage(1));
  document.querySelector('#users-table thead').addEventListener('click', handleSort);
  document.querySelector('#search-input').addEventListener('input', handleSearch);

  // Attach event listeners for user actions
  document.querySelector('#users-table-body').addEventListener('click', handleTableClick);
  document.querySelector('#add-user-form').addEventListener('submit', handleAddUser);
  document.querySelector('#edit-user-form').addEventListener('submit', handleSaveChanges);
  document.querySelector('#add-user-button').addEventListener('click', handleAddUserClick);

  // Attach event listeners for modal actions
  document.querySelector('#cancel-add-button').addEventListener('click', () => closeModal('#add-user-modal'));
  document.querySelector('#cancel-edit-button').addEventListener('click', () => closeModal('#edit-user-modal'));
  document.querySelector('#cancel-delete-button').addEventListener('click', () => closeModal('#delete-user-modal'));
  document.querySelector('#confirm-delete-button').addEventListener('click', handleConfirmDelete);
}

// User rendering function
// In public/js/userScript.js

function renderUsers(users) {
  const tbody = document.querySelector('#users-table-body');
  if (!tbody) return;

  if (!users || users.length === 0) {
    // If no users are found, render a message in the table
    tbody.innerHTML = `
      <tr style="height: 300px;">
        <td colspan="5" class="text-center align-middle text-gray-500">
          <div class="flex flex-col items-center justify-center">
            <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4.125 4.125 0 00-6.322 6.322l6.5 6.5a.75.75 0 001.06 0l6.5-6.5a4.125 4.125 0 00-6.322-6.322L12 4.354z" />
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4.125 4.125 0 00-6.322 6.322l6.5 6.5a.75.75 0 001.06 0l6.5-6.5a4.125 4.125 0 00-6.322-6.322L12 4.354z" />
            </svg>
            <p class="mt-2 text-lg">No results found</p>
            <p class="text-sm text-gray-400">Try adjusting your search or filters.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(user => {
    const registeredDate = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    // Render each user row with the appropriate data
    return `
      <tr class="border-b border-gray-200 hover:bg-gray-50">
        <td class="px-6 py-3 whitespace-nowrap">
          <span class="font-medium text-gray-900">${user.name}</span>
        </td>
        <td class="px-6 py-3 whitespace-nowrap text-gray-500 truncate">
          ${user.email}
        </td>
        <td class="px-6 py-3 whitespace-nowrap text-gray-500">
          ${registeredDate}
        </td>
        <td class="px-6 py-3 whitespace-nowrap text-center">
          <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
        </td>
        <td class="px-6 py-3 whitespace-nowrap text-center text-sm font-medium">
          <button data-action="edit" data-userid="${user.id}" class="text-blue-600 hover:text-blue-800 underline">Edit</button>
          <button data-action="delete" data-userid="${user.id}" class="text-red-600 hover:text-red-800 ml-2 underline">Delete</button>
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
  const overlay = document.querySelector('#loading-overlay');

  try {
    // Show the overlay to indicate loading is in progress
    overlay.classList.remove('hidden');

    const params = new URLSearchParams(state);
    const res = await fetch(`${USERS_API_ENDPOINT}?${params.toString()}`);

    if (!res.ok) throw new Error(`Server responded with status: ${res.status}`);

    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.error || 'API returned an error.');

    // This happens so fast after the loading state that it feels seamless.
    renderUsers(data.users);
    updateSortIndicators();
    renderPagination(data.pagination);

  } catch (error) {
    console.error('Error loading users:', error);
    renderError(error.message); // Show the error in the table
  } finally {
    overlay.classList.add('hidden');
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


let searchTimeout;
// Handle search input
function handleSearch(event) {
  clearTimeout(searchTimeout);
  const searchTermValue = event.target.value;

  searchTimeout = setTimeout(() => {
    state.search = searchTermValue;
    // Reset to page 1 when a new search is initiated
    // This prevents issues where the user is on page 3 of results that no longer exist
    state.page = 1;
    loadUsers();
  }, 300);
}

// Handle sorting when a table header is clicked
function handleSort(event) {
  const column = event.target.dataset.sort;
  if (!column) return; // Ignore clicks on non-sortable headers

  // If clicking the same column, flip the sort order
  if (state.sortBy === column) {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // If clicking a new column, sort by it in ascending order
    state.sortBy = column;
    state.sortOrder = 'asc';
  }

  // Reload the data with the new sorting state
  loadUsers();
}

// Update the sort indicators in the table headers
function updateSortIndicators() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    // First, remove any existing styles and indicators
    th.classList.remove('bg-gray-300');
    th.innerHTML = th.innerHTML.replace(/ (↑|↓)/g, '');

    // Then, add the style and indicator to the currently active column
    if (th.dataset.sort === state.sortBy) {
      th.classList.add('bg-gray-300');
      th.innerHTML += state.sortOrder === 'asc' ? ' ↑' : ' ↓';
    }
  });
}

// Render pagination information and controls
function renderPagination(pagination) {
  const paginationInfo = document.querySelector('#pagination-info');
  const prevButton = document.querySelector('#prev-button');
  const nextButton = document.querySelector('#next-button');

  if (pagination.totalUsers === 0) {
    paginationInfo.textContent = 'No results';
    prevButton.disabled = true;
    nextButton.disabled = true;
    return;
  }

  paginationInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages} (${pagination.totalUsers} total users)`;
  prevButton.disabled = pagination.page <= 1;
  nextButton.disabled = pagination.page >= pagination.totalPages;
}

// Change page function for pagination controls
function changePage(direction) {
  // direction will be +1 for Next, -1 for Previous
  state.page += direction;
  loadUsers();
}

// Handle limit change for pagination
function handleLimitChange(event) {
  const newLimit = parseInt(event.target.value, 10);
  state.limit = newLimit;

  // CRUCIAL: When the user changes the page size, always reset to page 1
  // to avoid being on a page that no longer exists (e.g., page 5 of 10-item pages).
  state.page = 1;

  loadUsers();
}
