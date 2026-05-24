import { db } from './firebase-config.js';
import {
  collection, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

async function loadAnnouncements() {
  try {
    const q = query(
      collection(db, 'announcements'),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Announcements:', e.message);
    return [];
  }
}

async function renderTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  try {
    const items = await loadAnnouncements();
    if (items.length === 0) return;
    const html = items.map(a =>
      `<span class="ticker-item">${a.title}</span>`
    ).join('');
    track.innerHTML = html + html;
  } catch (e) {
    console.warn('Ticker error:', e.message);
  }
}

export { loadAnnouncements, renderTicker };