// Shared site behavior: mobile nav + footer year
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  const setOpen = (open) => {
    mainNav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };

  navToggle.addEventListener('click', () => setOpen(!mainNav.classList.contains('open')));

  // Close after tapping a link (mobile) or pressing Escape
  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
