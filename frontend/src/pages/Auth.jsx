import logo from '../assets/logo.png';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [debugLogs, setDebugLogs] = useState([]);

  const addLog = (msg) => {
    console.log(msg);
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    addLog(`Attempting ${isLogin ? 'Login' : 'Signup'}...`);
    try {
      if (isLogin) {
        await loginWithEmail(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsSubmitting(false);
          return;
        }
        await signupWithEmail(email.trim(), password, name.trim());
      }
      addLog('Auth call successful');
    } catch (err) {
      addLog(`Error: ${err.message}`);
      // Show user-friendly error messages
      const code = err.code;
      if (code === 'auth/email-already-in-use') setError('This email is already registered. Try logging in.');
      else if (code === 'auth/invalid-email') setError('Invalid email address.');
      else if (code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else if (code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (code === 'auth/user-not-found') setError('No account found with this email.');
      else if (code === 'auth/wrong-password') setError('Incorrect password.');
      else setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    addLog('Starting Google Sign-In...');
    try {
      await loginWithGoogle();
      addLog('Google call finished');
    } catch (err) {
      addLog(`Google Error: ${err.message || JSON.stringify(err)}`);
      console.error('Google Sign-In Error:', err);
      // Don't show error if user just cancelled
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request' && err.message !== 'arg:2') {
        const errorMsg = err.message || JSON.stringify(err);
        setError(`Google sign-in failed: ${errorMsg}`);
        // If it's a native error 10, explain it's likely a SHA-1 issue
        if (errorMsg.includes('10') || errorMsg.toLowerCase().includes('developer_error')) {
          setError('Sign-in blocked (Developer Error 10). This usually means the SHA-1 fingerprint is missing in Firebase Console.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', padding: 40, animation: 'scale-in 0.3s ease-out', textAlign: 'center' }}>
        <img src={logo} alt="PactTrack Logo" style={{ width: 80, height: 80, marginBottom: 16, objectFit: 'contain' }} />
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>PactTrack</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
          {isLogin ? 'Welcome back to your habits!' : 'Start your accountability journey'}
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#ef4444', textAlign: 'left' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: 16, textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
              <input className="input" type="text" placeholder="e.g. Alex" value={name} onChange={e => setName(e.target.value)} required aria-label="Your name" />
            </div>
          )}
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
            <input className="input" type="email" placeholder="alex@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus aria-label="Your email" />
          </div>
          <div style={{ marginBottom: 24, textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Password</label>
            <input className="input" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} aria-label="Your password" />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 16, opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting || !email.trim() || !password || (!isLogin && !name.trim())}>
            {isSubmitting ? '...' : (isLogin ? 'Log In' : 'Sign Up')} 🚀
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          style={{
            width: '100%', padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border-primary)',
            background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1,
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
          aria-label="Sign in with Google"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ background: 'none', border: 'none', color: '#14b8a6', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

        {debugLogs.length > 0 && (
          <div style={{ marginTop: 20, padding: 10, background: '#000', color: '#0f0', fontSize: 10, borderRadius: 6, textAlign: 'left', fontFamily: 'monospace', opacity: 0.7 }}>
            <div style={{ borderBottom: '1px solid #333', marginBottom: 4, paddingBottom: 2, fontWeight: 'bold' }}>DEBUG LOG:</div>
            {debugLogs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
