import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfF87BZRGtmvPbk_aBGVuZy9QZIg2wGBs",
  authDomain: "software-shop-e3b77.firebaseapp.com",
  projectId: "software-shop-e3b77",
  storageBucket: "software-shop-e3b77.firebasestorage.app",
  messagingSenderId: "554669935297",
  appId: "1:554669935297:web:c5f277538b4f2f546ee240"
};

// Initialize Firebase (SSR-safe check to prevent duplicate initialization)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
