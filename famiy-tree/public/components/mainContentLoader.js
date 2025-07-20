export function initMainContentLoader() {
  const links = document.querySelectorAll(".sidebar-link");
  const main = document.getElementById("main-content");

  if (!main) return;

  async function loadPage(pageName) {
    try {
      const res = await fetch(`${pageName}.html`);
      if (!res.ok) throw new Error(`Could not load ${pageName}.html`);
      const html = await res.text();

      main.innerHTML = html;
      window.history.pushState({}, "", `/${pageName}`);

       // Dynamically import the script if it exists
      const scriptPath = `/js/${pageName}.js`;

      try {
        const module = await import(scriptPath);

        // Call a generic init function if exported
        if (typeof module.init === 'function') {
          module.init();
        } else if (typeof module[`init${capitalize(pageName)}`] === 'function') {
          module[`init${capitalize(pageName)}`]();
        }
      } catch (importErr) {
        // Optional: warn but don't break if no script exists
        console.warn(`No script or init function for ${pageName}`);
      }

    } catch (err) {
      main.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message}</div>`;
    }
  }

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      if (page) loadPage(page);
    });
  });

  // Load correct page on initial load based on URL
  const current = window.location.pathname.replace('/', '') || 'dashboard';
  loadPage(current);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
