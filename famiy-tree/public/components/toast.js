export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');

  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `
    px-4 py-2 rounded shadow text-white text-sm animate-fade-in
    ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
  `;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animation styles only once
if (!document.getElementById('toast-style')) {
  const style = document.createElement('style');
  style.id = 'toast-style';
  style.textContent = `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
      transition: opacity 0.3s ease-out;
    }

    .opacity-0 {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);
}
