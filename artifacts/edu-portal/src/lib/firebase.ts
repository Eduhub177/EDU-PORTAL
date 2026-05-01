import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAMD6AIDid41zxHQBUcMIfxAxRKW1JEYCA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "edu-portal-fb303.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "edu-portal-fb303",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "edu-portal-fb303.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729175681273",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729175681273:web:ac6f6342284fd3f70d5a28",
};

export const isFirebaseConfigured = true;

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);

export { firebaseConfig };

console.info("[Firebase] initialized for project:", firebaseConfig.projectId);
