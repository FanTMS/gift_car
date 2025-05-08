import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyCzZruzcFhVYZ0jLwkOHsnUP7kBiiBs64w",
  authDomain: "gift-car-ca1de.firebaseapp.com",
  databaseURL: "https://gift-car-ca1de-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gift-car-ca1de",
  storageBucket: "gift-car-ca1de.firebasestorage.app",
  messagingSenderId: "521119514039",
  appId: "1:521119514039:web:fcf3ec4d3cace88f09bc32",
  measurementId: "G-BG8MXV916E"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
export const db = getFirestore(app);

// Включение оффлайн-персистентности для улучшения производительности
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Персистентность не может быть применена, т.к. открыто несколько вкладок');
    } else if (err.code === 'unimplemented') {
      console.error('Браузер не поддерживает все функции, необходимые для персистентности');
    }
  });

// Инициализация Auth
export const auth = getAuth(app);

// Инициализация Storage
export const storage = getStorage(app);

export default app; 