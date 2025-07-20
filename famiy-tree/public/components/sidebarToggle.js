export function initSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarLogo = document.getElementById('sidebar-logo');
  const sidebarLinksText = document.querySelectorAll('.sidebar-link-text');
  const toggleIcon = sidebarToggle.querySelector('svg');

  if (!sidebar || !sidebarToggle || !toggleIcon) {
    console.warn('Sidebar toggle setup skipped: required elements not found.');
    return;
  }

  sidebarToggle.addEventListener('click', () => {
    // Toggle sidebar width
    sidebar.classList.toggle('w-56');
    sidebar.classList.toggle('w-16');

    // Determine state
    const collapsed = sidebar.classList.contains('w-16');

    // Logo visibility
    if (sidebarLogo) {
      sidebarLogo.classList.toggle('hidden', collapsed);
    }

    // Nav link text visibility
    sidebarLinksText.forEach(span => {
      span.classList.toggle('hidden', collapsed);
    });

    // Change icon based on state
    toggleIcon.innerHTML = collapsed
      ? `
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M15 3v18"></path>
      `
      : `
        <rect width="18" height="18" x="3" y="3" rx="2"></rect>
        <path d="M9 3v18"></path>
      `;

    // Optional: update class names for styling purposes
    toggleIcon.classList.toggle('lucide-panel-left', !collapsed);
    toggleIcon.classList.toggle('lucide-panel-right', collapsed);
  });
}
