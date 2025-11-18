// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- REEMPLAZA ESTO CON TUS DATOS DE FIREBASE ---
// (Los encuentras en: Configuración del Proyecto -> General -> Tus apps)
const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI_TU_PROJECT_ID.firebaseapp.com",
  projectId: "PEGA_AQUI_TU_PROJECT_ID",
  storageBucket: "PEGA_AQUI_TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TUS_NUMEROS",
  appId: "TU_APP_ID"
};
// ------------------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);