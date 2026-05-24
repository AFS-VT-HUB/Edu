// ── Main JS ──

window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 400); }
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  });
}

// Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || (() => {
    const el = document.createElement('div');
    el.id = 'toast-container';
    document.body.appendChild(el);
    return el;
  })();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// Ticker
const track = document.querySelector('.ticker-track');
if (track) { track.innerHTML += track.innerHTML; }

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('animate-fadeInUp'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-profile')) {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
  }
});

// Back button
function addBackButton(label = 'Back to Home', href = '../index.html') {
  const existing = document.getElementById('back-btn-wrap');
  if (existing) return;
  const wrap = document.createElement('div');
  wrap.id = 'back-btn-wrap';
  wrap.style.cssText = 'max-width:1200px;margin:0 auto;';
  wrap.innerHTML = `<a href="${href}" class="back-btn"><i class="fa fa-arrow-left"></i> ${label}</a>`;
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.insertAdjacentElement('afterend', wrap);
}

window.showToast = showToast;
window.addBackButton = addBackButton;