import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXcxTjCdkl8C_Jy4RbglLg_vX-BX6qMRE",
  authDomain: "animebite-57d38.firebaseapp.com",
  projectId: "animebite-57d38",
  storageBucket: "animebite-57d38.firebasestorage.app",
  messagingSenderId: "634867345512",
  appId: "1:634867345512:web:7c2990a55037753bc5b3dd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
