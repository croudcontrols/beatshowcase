import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;

try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics not initialized - may be in SSR or analytics blocked");
}

// Try reconnecting Firestore - explicit export
export const reconnectFirestore = async () => {
  try {
    // We'll only log but not actually disable the network initially
    console.log("Checking Firestore connection status...");
    
    // Create a promise that resolves when network is enabled
    return new Promise<void>((resolve) => {
      // Wait a moment before doing anything to let initialization complete
      setTimeout(async () => {
        try {
          await enableNetwork(db);
          console.log("Firestore network connected");
          resolve();
        } catch (e) {
          console.error("Error enabling network:", e);
          resolve(); // Still resolve so app continues
        }
      }, 1000);
    });
  } catch (error) {
    console.error("Error with Firestore connection:", error);
  }
};

// Call reconnect but don't wait for it to complete
reconnectFirestore();

// For debugging
console.log("Firebase initialized with project:", firebaseConfig.projectId);

// Export all Firebase services except reconnectFirestore (already exported above)
export { app, auth, db, storage, analytics };