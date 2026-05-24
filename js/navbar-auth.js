import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm01A9_MlZyuyk_7QsizK0_SpsLYJCNrw",
  authDomain: "afs-virtual-tutor-hub.firebaseapp.com",
  projectId: "afs-virtual-tutor-hub",
  storageBucket: "afs-virtual-tutor-hub.firebasestorage.app",
  messagingSenderId: "146570288811",
  appId: "1:146570288811:web:96da475a769c18696321ee"
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Inject profile/dropdown styling safely ──
const navCSS = document.createElement('style');
navCSS.textContent = `
  /* Profile avatar style */
  .afs-nav-profile { position: relative; margin-left: 10px; display: inline-block; vertical-align: middle; }
  .afs-nav-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: #FFD700; color: #000;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 800; cursor: pointer;
    border: 2px solid #333; transition: border-color .15s;
    overflow: hidden;
  }
  .afs-nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .afs-nav-avatar:hover { border-color: #FFD700; }
  
  /* Dropdown Menu matching Dark/Gold Theme */
  .afs-nav-dd {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: #111111; border: 1px solid #333;
    border-radius: 12px; min-width: 210px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    display: none; z-index: 9999; overflow: hidden;
    text-align: left;
  }
  .afs-nav-dd.open { display: block; }
  .afs-nav-dd-head {
    padding: 14px 16px; border-bottom: 1px solid #222;
    background: #1a1a1a;
  }
  .afs-nav-dd-head strong { display: block; font-size: 0.9rem; color: #fff; }
  .afs-nav-dd-head span   { font-size: 0.75rem; color: #888; }
  .afs-nav-dd a, .afs-nav-dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; font-size: 0.88rem; color: #ccc;
    text-decoration: none; cursor: pointer; transition: background .12s, color .12s;
  }
  .afs-nav-dd a:hover, .afs-nav-dd-item:hover { background: #222; color: #FFD700; }
  .afs-nav-dd a i, .afs-nav-dd-item i { width: 16px; color: #888; }
  .afs-nav-dd-divider { height: 1px; background: #222; }
  .afs-nav-dd-logout { color: #ef4444 !important; }
  .afs-nav-dd-logout i { color: #ef4444 !important; }

  /* Notification bell */
  .afs-notif-wrap { position: relative; cursor: pointer; padding: 6px; margin-left: 10px; display: inline-flex; align-items: center; vertical-align: middle; }
  .afs-notif-wrap i { font-size: 1.2rem; color: #ccc; }
  .afs-notif-wrap i:hover { color: #FFD700; }
  .afs-notif-badge {
    position: absolute; top: 0px; right: 0px;
    background: #ef4444; color: #fff;
    border-radius: 50%; width: 16px; height: 16px;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #111;
  }
`;
document.head.appendChild(navCSS);

// ── Update HTML navbar after auth ──
function updateNavbarAuth(p, basePath, pagesPath) {
  const navLinks   = document.querySelector('.navbar-links');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!navLinks) return;

  const initials  = (p.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const photoHTML = p.photoURL ? `<img src="${p.photoURL}" alt="${p.fullName}"/>` : initials;
  
  const dashLink  = p.role === 'admin'   ? `${pagesPath}admin-panel.html`
                  : p.role === 'teacher' ? `${pagesPath}teacher-dashboard.html`
                  :                        `${pagesPath}student-dashboard.html`;
  const roleLabel = p.role?.charAt(0).toUpperCase() + p.role?.slice(1);

  // FIXED: Sare original links hamesha barkarar rahen ge
  let links = `
    <a href="${basePath}index.html">Home</a>
    <a href="${pagesPath}faculty.html">Faculty</a>
    <a href="${pagesPath}courses.html">Courses</a>
    <a href="${pagesPath}about-ceo.html">About CEO</a>
    <a href="${pagesPath}blog.html">Blog</a>
    <a href="${pagesPath}faq.html">FAQ</a>
    <a href="${pagesPath}contact.html">Contact</a>
  `;

  // Notification bell icon (sirf student k liye)
  if (p.role === 'student') {
    const unread = parseInt(localStorage.getItem('afs_unread_count') || '0');
    links += `
      <div class="afs-notif-wrap" id="afs-notif-wrap" title="Notifications">
        <i class="fa fa-bell"></i>
        ${unread > 0 ? `<span class="afs-notif-badge" id="afs-notif-badge">${unread}</span>` : ''}
      </div>`;
  }

  // Profile Dropdown items setting based on role
  const ddItems = p.role === 'admin' ? `
    <a href="${pagesPath}admin-panel.html"><i class="fa fa-shield-alt"></i> Admin Panel</a>` :
  p.role === 'teacher' ? `
    <a href="${pagesPath}teacher-dashboard.html"><i class="fa fa-tachometer-alt"></i> Dashboard</a>
    <a href="${pagesPath}teacher-dashboard.html"><i class="fa fa-user-edit"></i> Edit Profile</a>` : `
    <a href="${pagesPath}student-dashboard.html"><i class="fa fa-tachometer-alt"></i> Dashboard</a>`;

  // Profile icon dynamic insertion
  links += `
    <div class="afs-nav-profile">
      <div class="afs-nav-avatar" id="afs-nav-avatar" title="${p.fullName}">${photoHTML}</div>
      <div class="afs-nav-dd" id="afs-nav-dd">
        <div class="afs-nav-dd-head">
          <strong>${p.fullName || 'User'}</strong>
          <span>${roleLabel} Account</span>
        </div>
        ${ddItems}
        <div class="afs-nav-dd-divider"></div>
        <div class="afs-nav-dd-item afs-nav-dd-logout" id="afs-nav-logout">
          <i class="fa fa-sign-out-alt"></i> Logout
        </div>
      </div>
    </div>`;

  // Purane links aur buttons update ho jayenge bina hide hue
  navLinks.innerHTML = links;

  // Mobile Menu update bina links uraye
  if (mobileMenu) {
    mobileMenu.innerHTML = `
      <a href="${basePath}index.html">Home</a>
      <a href="${pagesPath}faculty.html">Faculty</a>
      <a href="${pagesPath}courses.html">Courses</a>
      <a href="${pagesPath}about-ceo.html">About CEO</a>
      <a href="${pagesPath}blog.html">Blog</a>
      <a href="${pagesPath}faq.html">FAQ</a>
      <a href="${pagesPath}contact.html">Contact</a>
      <div style="height:1px; background:#222; margin:10px 0;"></div>
      <a href="${dashLink}" style="color:#FFD700; font-weight:600">My Dashboard</a>
      <a href="#" id="afs-mob-logout" style="color:#ef4444">Logout</a>`;
  }

  // Event Listeners for dropdown and links
  document.getElementById('afs-nav-avatar')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('afs-nav-dd')?.classList.toggle('open');
  });

  document.getElementById('afs-notif-wrap')?.addEventListener('click', () => {
    localStorage.removeItem('afs_unread_count');
    document.getElementById('afs-notif-badge')?.remove();
    window.location.href = `${pagesPath}student-dashboard.html`;
  });

  async function doLogout() {
    await signOut(auth);
    window.location.href = basePath + 'index.html';
  }
  document.getElementById('afs-nav-logout')?.addEventListener('click', doLogout);
  document.getElementById('afs-mob-logout')?.addEventListener('click', doLogout);
}

// ── Main setup navbar flow ──
async function setupNavbar(options = {}) {
  const {
    basePath   = '',
    pagesPath  = 'pages/'
  } = options;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return;

      // Handle notifications check safely
      try {
        const annSnap = await getDocs(query(collection(db, 'announcements'), where('isActive', '==', true)));
        const readIds = JSON.parse(localStorage.getItem('afs_read_notifs') || '[]');
        const unread  = annSnap.docs.filter(d => !readIds.includes(d.id)).length;
        if (unread > 0) {
          localStorage.setItem('afs_unread_count', unread);
        }
      } catch (e) {}

      // UI update call
      updateNavbarAuth(snap.data(), basePath, pagesPath);
    } catch (err) {
      console.error("Auth navbar update error:", err);
    }
  });
}

// Dropdown close logic
document.addEventListener('click', (e) => {
  if (!e.target.closest('.afs-nav-profile')) {
    document.querySelectorAll('.afs-nav-dd').forEach(d => d.classList.remove('open'));
  }
});

export { setupNavbar, auth, db };