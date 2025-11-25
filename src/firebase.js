import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAVsUlZ6sd10h3ZmpPnVHX5msqFKlj0sqU",
    authDomain: "freecanvas-3226d.firebaseapp.com",
    projectId: "freecanvas-3226d",
    storageBucket: "freecanvas-3226d.firebasestorage.app",
    messagingSenderId: "334685049572",
    appId: "1:334685049572:web:aaf139022f3da31d0d92f1",
    measurementId: "G-D9X6HRR528"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };
