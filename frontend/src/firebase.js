import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBk1v6jy4CvuuRvDMLAKO8qzC4X2BLpsUE",
  authDomain: "habit-tracker-pacttrack.firebaseapp.com",
  projectId: "habit-tracker-pacttrack",
  storageBucket: "habit-tracker-pacttrack.firebasestorage.app",
  messagingSenderId: "975258431449",
  appId: "1:975258431449:web:31591969805ff17a0273c8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Auth Helper Functions ---

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Set the display name on the Firebase profile
  await updateProfile(result.user, { displayName });
  return result;
};

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export { auth };
export default app;
