import { initializeApp } from 'firebase/app';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
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
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Auth Helper Functions ---

export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    // We use the Web Client ID from google-services.json (client_type 3)
    return await FirebaseAuthentication.signInWithGoogle({
      webClientId: '975258431449-qr21obh90to37oebf1mk9luh58i0n5cc.apps.googleusercontent.com',
      useCredentialManager: false, // Fallback to legacy Google Sign-In to avoid "device doesn't support" error
    });
  }
  return signInWithPopup(auth, googleProvider);
};

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  // Set the display name on the Firebase profile
  await updateProfile(result.user, { displayName });
  return result;
};

export const signInWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = async () => {
  if (Capacitor.isNativePlatform()) {
    await FirebaseAuthentication.signOut();
  }
  return signOut(auth);
};

export { auth };
export default app;
