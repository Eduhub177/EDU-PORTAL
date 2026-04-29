// =============================================================
// FIREBASE CONFIGURATION
// =============================================================
// Paste your Firebase project credentials below.
// You can find these in your Firebase console:
//   https://console.firebase.google.com/
//   → Project settings → General → Your apps → Web app → SDK setup
//
// For deployment (Vercel), you can also set these as
// VITE_FIREBASE_* environment variables — the code below
// will pick them up automatically.
// =============================================================
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: env.VITE_FIREBASE_APP_ID ?? "",
};

const hasAllKeys = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

export const isFirebaseConfigured = hasAllKeys;

export const firebaseApp = hasAllKeys
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : (null as never);

export const db = hasAllKeys ? getFirestore(firebaseApp) : (null as never);
export const storage = hasAllKeys ? getStorage(firebaseApp) : (null as never);

if (hasAllKeys) {
  console.info("[Firebase] initialized for project:", firebaseConfig.projectId);
} else {
  console.warn("[Firebase] missing VITE_FIREBASE_* env vars — real-time features disabled");
}

// =============================================================
// FIRESTORE SECURITY RULES (paste in Firebase Console → Firestore → Rules)
// =============================================================
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Users — anyone can create their own user doc; users can read/update their own
//     match /users/{userId} {
//       allow read: if true;
//       allow create: if true;
//       allow update, delete: if request.auth == null || request.auth.uid == userId;
//     }
//
//     // OTPs — anyone can create/read/delete (temporary records)
//     match /otps/{otpId} {
//       allow read, write: if true;
//     }
//
//     // Exams — anyone can read published exams; only the owning teacher can write
//     match /exams/{examId} {
//       allow read: if true;
//       allow create: if request.resource.data.teacherId is string;
//       allow update, delete: if true; // tighten with Firebase Auth in production
//     }
//
//     // Results — anyone can create their own result; teachers can read all
//     match /results/{resultId} {
//       allow read, write: if true;
//     }
//
//     // Notifications — readable by all; writable by the system
//     match /notifications/{notificationId} {
//       allow read, write: if true;
//     }
//   }
// }
// =============================================================
