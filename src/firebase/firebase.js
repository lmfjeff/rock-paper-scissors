import { initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// this app use firebase auth, firestore on frontend

const firebaseConfig = {
  apiKey: 'AIzaSyC4AJ_o-PAnuQ0VWDXFsqmXkntc411FyDw',
  authDomain: 'rock-paper-scissors-a5033.firebaseapp.com',
  projectId: 'rock-paper-scissors-a5033',
  storageBucket: 'rock-paper-scissors-a5033.appspot.com',
  messagingSenderId: '139081941799',
  appId: '1:139081941799:web:91b620223b2c7152501f02',
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp)

// uncomment during local development, using firestore & functions emulators
// connectFirestoreEmulator(firestore, 'localhost', 8080);

export {firebaseApp, firebaseAuth, googleAuthProvider, firestore}