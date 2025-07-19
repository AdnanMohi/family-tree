import { showToast } from '../components/toast.js';


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
          showToast('✅ Login successful!', 'success');
          window.location.href = '/dashboard'; // redirect to dashboard
        } else {
          // Show error toast
          showToast('Invalid credentials, please try again.', 'error');
        }
      } catch (err) {
        // Show error toast
        showToast('Something went wrong', 'error');
        console.error(err);
      }
    });
  }
});
