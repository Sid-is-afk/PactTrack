const admin = require('firebase-admin');

// Initialize Firebase Admin with Project ID
try {
  admin.initializeApp({
    projectId: 'habit-tracker-pacttrack'
  });
  console.log('Firebase Admin initialized for:', 'habit-tracker-pacttrack');
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase Admin initialization error', error.stack);
  }
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Token Verification Failed:', error.code, error.message);
    return res.status(403).json({ 
      error: 'Unauthorized: Invalid token',
      details: error.code === 'auth/id-token-expired' ? 'Token expired' : 'Token verification failed'
    });
  }
};

module.exports = { verifyToken };
