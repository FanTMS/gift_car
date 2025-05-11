import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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
const db = getFirestore(app);

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
const auth = getAuth(app);

// Инициализация Storage
const storage = getStorage(app);

// Инициализация Functions
const functions = getFunctions(app);

// Подключение к эмулятору Functions в режиме разработки
if (process.env.NODE_ENV === 'development') {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase Functions emulator');
  } catch (error) {
    console.error('Failed to connect to Firebase Functions emulator:', error);
  }
}

export { app, db, auth, storage, functions }; 