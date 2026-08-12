/**
 * @file src/config/firebase.js
 * @description Official Firebase Client SDK Initialization using Environment Variables.
 */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'foodrush-app-e8b58.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'foodrush-app-e8b58',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'foodrush-app-e8b58.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '23238306085',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:23238306085:web:7816c789fea34ee28592cc',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
};
