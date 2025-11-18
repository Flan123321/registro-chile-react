import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TUS CREDENCIALES REALES (Copiadas de lo que me enviaste)
const firebaseConfig = {
  apiKey: "AIzaSyAAFQTs3e1fMUKeNFLRRJmYUruiWBUpfB4",
  authDomain: "registro-chile.firebaseapp.com",
  projectId: "registro-chile",
  storageBucket: "registro-chile.firebasestorage.app",
  messagingSenderId: "878816207410",
  appId: "1:878816207410:web:0a9d2fbdcb53e4c4aa922b"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos para que App.jsx la pueda usar
export const db = getFirestore(app);