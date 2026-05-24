import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm01A9_MlZyuyk_7QsizK0_SpsLYJCNrw",
  authDomain: "afs-virtual-tutor-hub.firebaseapp.com",
  projectId: "afs-virtual-tutor-hub",
  storageBucket: "afs-virtual-tutor-hub.firebasestorage.app",
  messagingSenderId: "146570288811",
  appId: "1:146570288811:web:96da475a769c18696321ee"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

async function registerStudent(data) {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    role: 'student',
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    country: data.country,
    curriculum: data.curriculum,
    grade: data.grade,
    subjects: data.subjects,
    language: data.language,
    registeredAt: serverTimestamp(),
    isApproved: true
  });
  return cred.user;
}

async function registerTeacher(data) {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
  await setDoc(doc(db, 'users', cred.user.uid), {
    role: 'teacher',
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    qualification: data.qualification,
    experience: data.experience,
    subjects: data.subjects,
    curricula: data.curricula,
    introVideo: data.introVideo,
    hourlyRate: data.hourlyRate || '',
    paymentMethod: data.paymentMethod,
    bio: data.bio || '',
    registeredAt: serverTimestamp(),
    isApproved: false,
    avgRating: 0,
    reviewCount: 0
  });
  return cred.user;
}

async function loginWithGoogle(defaultRole = 'student') {
  const result = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, 'users', result.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      role: defaultRole,
      fullName: result.user.displayName,
      email: result.user.email,
      registeredAt: serverTimestamp(),
      isApproved: true
    });
  }
  return { user: result.user, profile: snap.exists() ? snap.data() : null };
}

async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, 'users', cred.user.uid));
  return { user: cred.user, profile: snap.data() };
}

async function logoutUser() {
  await signOut(auth);
  window.location.href = '/index.html';
}

function watchAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      callback(user, snap.exists() ? snap.data() : null);
    } else {
      callback(null, null);
    }
  });
}

function requireAuth(role = null, redirectTo = '/pages/login.html') {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) { window.location.href = redirectTo; return; }
      if (role) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const profile = snap.data();
        if (profile?.role !== role) { window.location.href = redirectTo; return; }
        resolve({ user, profile });
      } else {
        resolve({ user });
      }
    });
  });
}

export { auth, db, googleProvider, registerStudent, registerTeacher, loginWithGoogle, loginUser, logoutUser, watchAuthState, requireAuth };