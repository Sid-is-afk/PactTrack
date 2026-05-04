import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut } from '../firebase';
import { apiPost } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        };
        setUser(appUser);

        // Sync user to backend database (upsert)
        try {
          await apiPost('/users', {
            name: appUser.name,
            email: appUser.email,
          });
        } catch (err) {
          // Non-critical: user might already exist, or backend might be offline
          console.warn('Could not sync user to backend:', err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithGoogle();
    // onAuthStateChanged will handle the rest
  };

  const loginWithEmail = async (email, password) => {
    await signInWithEmail(email, password);
  };

  const signupWithEmail = async (email, password, displayName) => {
    await signUpWithEmail(email, password, displayName);
  };

  const logout = async () => {
    await logOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
