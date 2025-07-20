import { showToast } from '../components/toast.js';

document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    const res = await fetch('/logout', { method: 'POST' });
    if (res.ok) {
       showToast('👋 Logged out successfully', 'success');
       setTimeout(() => 
        window.location.href = '/login'
      , 2000);
    } else {
      console.error('Logout failed');
    }
  } catch (err) {
    console.error('Error during logout:', err);
  }
});
