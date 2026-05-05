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
  updateProfile,
  signInWithCredential
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
    // 1. Get the token from the native Google Sign-In
    const result = await FirebaseAuthentication.signInWithGoogle({
      webClientId: '975258431449-qr21obh90to37oebf1mk9luh58i0n5cc.apps.googleusercontent.com',
      useCredentialManager: false,
    });

    // 2. Manually sign in to the Firebase JS SDK using the ID Token
    if (result.idToken) {
      const credential = GoogleAuthProvider.credential(result.idToken);
      return await signInWithCredential(auth, credential);
    }
    return result;
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
