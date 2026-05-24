import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm01A9_MlZyuyk_7QsizK0_SpsLYJCNrw",
  authDomain: "afs-virtual-tutor-hub.firebaseapp.com",
  projectId: "afs-virtual-tutor-hub",
  storageBucket: "afs-virtual-tutor-hub.firebasestorage.app",
  messagingSenderId: "146570288811",
  appId: "1:146570288811:web:96da475a769c18696321ee"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };