import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyAX1S5jBGfHHGYusB82-JadXFW0OcRYD5g',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'nextwatch-b245f.firebaseapp.com',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'nextwatch-b245f',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'nextwatch-b245f.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '116507453343',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:116507453343:web:03246885a8d7339987bfaa',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export default app;
