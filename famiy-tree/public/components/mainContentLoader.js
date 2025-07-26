const pageScriptMap = {
  'users': '/js/usersScript.js',

  // Add more pages as needed
};

export function initMainContentLoader() {
  const links = document.querySelectorAll(".sidebar-link");
  const main = document.getElementById("main-content");
  let currentPage = '';
  let currentModule = null; // Stores the module for the current page to allow for cleanup

  if (!main) {
    console.error("Main content area not found (id='main-content'). Aborting.");
    return;
  }

  // --- Helper Functions ---
  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  }

  function highlightActiveSidebar(pageName) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.classList.remove('bg-indigo-600', 'text-white');
      link.setAttribute('aria-current', 'false');
      const svg = link.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-white');
        svg.classList.add('text-indigo-400');
      }
    });

    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('bg-indigo-600', 'text-white');
      activeLink.setAttribute('aria-current', 'page');
      const svg = activeLink.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-indigo-400');
        svg.classList.add('text-white');
      }
    }
  }

  // Cleanup function to reset the current module
  function cleanupCurrentModule() {
    if (currentModule && typeof currentModule.cleanup === 'function') {
      try {
        currentModule.cleanup();
        console.log(`Cleanup function executed for page: ${currentPage}`);
      } catch (e) {
        console.error(`Error during cleanup for ${currentPage}:`, e);
      }
    }
    currentModule = null; // Clear the reference
  }


  // --- Core SPA Logic ---
  async function loadPage(pageName) {
    if (pageName === currentPage) return; // Prevent reloading the same page

    cleanupCurrentModule(); // Clean up the previous page's resources first!

    currentPage = pageName;
    console.log(`Loading page: ${currentPage}`);

    try {
      const res = await fetch(`${pageName}.html`);
      if (!res.ok) throw new Error(`Could not load ${pageName}.html (Status: ${res.status})`);
      const html = await res.text();

      // Update DOM and Browser History
      main.innerHTML = html;
      window.history.pushState({ page: pageName }, "", `/${pageName}`);

      // Update UI
      highlightActiveSidebar(pageName);

      // Load page-specific JavaScript using the map
      const scriptPath = pageScriptMap[pageName];
      if (scriptPath) {
        console.log(`Attempting to load script: ${scriptPath}`);
        try {
          const module = await import(scriptPath);
          currentModule = module; // Store the new module

          if (typeof module.init === 'function') {
            module.init();
          } else if (typeof module[`init${capitalize(pageName)}`] === 'function') {
            module[`init${capitalize(pageName)}`]();
          }
        } catch (importErr) {
          console.error(`Failed to load or execute script for ${pageName} at ${scriptPath}`, importErr);
        }
      } else {
        console.info(`No JavaScript file configured for page: ${pageName}`);
      }

    } catch (err) {
      console.error(`Failed to load page "${pageName}":`, err);
      main.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message}</div>`;
      currentPage = 'error'; // Set state to error
    }
  }


  // Event Listeners and Initial Load ---
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) loadPage(page);
    });
  });

  // Handle browser's back/forward buttons
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
      console.log(`Popstate: Navigating to ${event.state.page}`);
      // Avoid calling pushState again, just load the content
      // The `loadPage` function will handle the rest (cleanup, loading new module, etc.)
      loadPage(event.state.page);
    }
  });

  // Initial page load
  const initialPath = window.location.pathname.replace(/^\/+/, '') || 'dashboard';
  // Use replaceState to avoid cluttering history on the first load
  window.history.replaceState({ page: initialPath }, "", `/${initialPath}`);
  loadPage(initialPath);
}
