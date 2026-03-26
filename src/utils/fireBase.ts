import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// 🔥 Your config (same as before)
const firebaseConfig = {
    apiKey: "AIzaSyDAkQE43LQpYqGKbVYmiZ6Cec_Mdav5SaQ",
    authDomain: "hirewise-2998f.firebaseapp.com",
    projectId: "hirewise-2998f",
    storageBucket: "hirewise-2998f.firebasestorage.app",
    messagingSenderId: "367556109723",
    appId: "1:367556109723:web:af7b09319dd70628426d3e",
};

// 🔥 Initialize app
const app = initializeApp(firebaseConfig);

// ✅ EXPORT THESE (THIS WAS MISSING)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();