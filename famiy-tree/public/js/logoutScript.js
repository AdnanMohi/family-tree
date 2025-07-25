import { showToast } from '../components/toast.js';

const LOGOUT_API_ENDPOINT = '/api/logout';

// Function to initialize the logout button
export function initLogoutButton() {
  const logoutBtn = document.getElementById('logout-btn');

  // Safety check: if the logout button doesn't exist on the page, do nothing.
  if (!logoutBtn) {
    return;
  }

  logoutBtn.addEventListener('click', async () => {
    try {
      // Use the constant for the fetch call.
      const res = await fetch('api/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check if the HTTP response was successful.
      if (res.ok) {
        showToast('👋 Logged out successfully. Redirecting...', 'success');
        
        // Redirect to the login page after a short delay to let the user see the toast.
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);

      } else {
        // If the server responded with an error (e.g., 401, 500), handle it.
        const errorData = await res.json().catch(() => ({ error: 'Logout failed with an unknown server error.' }));
        throw new Error(errorData.error);
      }
    } catch (err) {
      // Catch any network errors or errors thrown from the block above.
      console.error('Error during logout:', err);
      showToast(err.message, 'error'); // Show a user-friendly error toast.
    }
  });
}
