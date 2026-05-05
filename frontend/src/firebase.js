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
  console.log('signInWithGoogle: Checking platform...');
  if (Capacitor.isNativePlatform()) {
    console.log('signInWithGoogle: Native platform detected. Calling FirebaseAuthentication...');
    // 1. Get the token from the native Google Sign-In
    const result = await FirebaseAuthentication.signInWithGoogle({
      webClientId: '975258431449-qr21obh90to37oebf1mk9luh58i0n5cc.apps.googleusercontent.com',
      useCredentialManager: false,
    });
    console.log('signInWithGoogle: Native result:', JSON.stringify(result));

    // The token might be at the top level or inside the credential object
    const idToken = result?.idToken || result?.credential?.idToken;

    if (idToken) {
      console.log('signInWithGoogle: ID Token found. Signing in with credential...');
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      console.log('signInWithGoogle: JS SDK sign-in successful');
      return userCredential;
    } else {
      const errorMsg = !result ? 'No result from plugin' : `Token missing. result has: ${Object.keys(result).join(', ')}`;
      console.error('signInWithGoogle Error:', errorMsg);
      throw new Error(errorMsg);
    }
    return result;
  }
  console.log('signInWithGoogle: Web platform detected. Calling signInWithPopup...');
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
