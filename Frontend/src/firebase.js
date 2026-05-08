// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDMuV9kZhRsSkvb7J3olVZC_AeMZVUlF94",
    authDomain: "bsuger.firebaseapp.com",
    projectId: "bsuger",
    storageBucket: "bsuger.firebasestorage.app",
    messagingSenderId: "842645035717",
    appId: "1:842645035717:web:9bbd06c08acc008eb6eeac",
    measurementId: "G-98SX9GQMVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export the Firebase services
export { auth, provider, signInWithPopup };