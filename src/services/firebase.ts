// src/services/firebase.ts

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-t5N1GLGSrgpnj6nyim4CZPIcwhaozvA",
  authDomain: "mina-tu-match-inmobiliario.firebaseapp.com",
  projectId: "mina-tu-match-inmobiliario",
  storageBucket: "mina-tu-match-inmobiliario.appspot.com",
  messagingSenderId: "242670989009",
  appId: "1:242670989009:web:559bb0ae38ecb74aa05ff0",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db };
