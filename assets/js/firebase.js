
// Import only from npm packages (after npm install firebase)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-YG19WRKIUFE__7608NYqrrehSWr8Zd0",
  authDomain: "empr-e.firebaseapp.com",
  projectId: "empr-e",
  storageBucket: "empr-e.appspot.com", // Corrigido
  messagingSenderId: "196840931732",
  appId: "1:196840931732:web:d316628d34006a8e37cf81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export {
  app,
  auth,
  db,
  firebaseConfig,
  isFirebaseConfigured,
  storage
};