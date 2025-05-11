import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser, signInWithCustomToken } from 'firebase/auth';
import { createOrUpdateUserProfile, getUserProfile, findUserByTelegramId } from '../firebase/userServices';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Создаем интерфейс для TelegramUser, используя данные из telegram.d.ts
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface UserContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  adminCompanyId: string | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false);
  const [adminCompanyId, setAdminCompanyId] = useState<string | undefined>(undefined);
  const [telegramAuthAttempted, setTelegramAuthAttempted] = useState(false); 

  // Получение данных Telegram из window.Telegram.WebApp.initDataUnsafe
  const getTelegramData = (): TelegramUser | null => {
    try {
      if (
        window.Telegram &&
        window.Telegram.WebApp &&
        (window.Telegram.WebApp as any).initDataUnsafe &&
        (window.Telegram.WebApp as any).initDataUnsafe.user
      ) {
        return (window.Telegram.WebApp as any).initDataUnsafe.user;
      }
    } catch (e) {
      console.error("Ошибка при получении данных Telegram:", e);
    }
    return null;
  };

  // Проверка роли пользователя
  const checkUserRole = (userProfile: User | null) => {
    if (!userProfile) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setIsCompanyAdmin(false);
      setAdminCompanyId(undefined);
      return;
    }

    // Проверяем роль
    const role = userProfile.role;
    setIsAdmin(role === 'admin' || role === 'superadmin');
    setIsSuperAdmin(role === 'superadmin');
    setIsCompanyAdmin(role === 'admin' && !!userProfile.companyId);
    setAdminCompanyId(userProfile.companyId);

    // Сохраняем ID текущего пользователя для компонента AdminsManager
    // (чтобы предотвратить удаление своей учетной записи)
    if (userProfile.id) {
      localStorage.setItem('currentUserId', userProfile.id);
    }
  };

  // Аутентификация Telegram пользователя
  const authenticateTelegramUser = async (tgUser: TelegramUser): Promise<FirebaseUser | null> => {
    try {
      // Проверяем, есть ли уже пользователь с таким Telegram ID в базе
      console.log("Поиск пользователя по Telegram ID:", tgUser.id);
      const existingUser = await findUserByTelegramId(tgUser.id.toString());
      
      if (existingUser) {
        console.log("Найден существующий пользователь:", existingUser);
        
        // Получаем токен для аутентификации через Firebase Functions
        try {
          const functions = getFunctions();
          const generateToken = httpsCallable(functions, 'generateAuthToken');
          const result = await generateToken({ telegramId: tgUser.id.toString() });
          const token = (result.data as any).token;
          
          if (token) {
            const auth = getAuth();
            const userCredential = await signInWithCustomToken(auth, token);
            console.log("Успешная аутентификация с кастомным токеном");
            
            // Обновляем профиль с актуальными данными из Telegram
            const profileData: Partial<User> = {
              displayName: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
              photoURL: tgUser.photo_url,
              telegramId: tgUser.id.toString(),
              username: tgUser.username,
              lastLogin: new Date()
            };
            
            await createOrUpdateUserProfile(userCredential.user.uid, profileData);
            return userCredential.user;
          }
        } catch (tokenError) {
          console.error("Ошибка при получении/использовании токена:", tokenError);
        }
      }
      
      // Если пользователь не найден, создаем нового
      const auth = getAuth();
      const { user: newUser } = await signInAnonymously(auth);
      
      // Создаем профиль с данными из Telegram
      const profileData: Partial<User> = {
        id: newUser.uid,
        displayName: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
        photoURL: tgUser.photo_url,
        telegramId: tgUser.id.toString(),
        username: tgUser.username,
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await createOrUpdateUserProfile(newUser.uid, profileData);
      console.log("Создан новый пользователь с данными Telegram");
      return newUser;
    } catch (error) {
      console.error("Ошибка при аутентификации Telegram пользователя:", error);
      return null;
    }
  };

  // Авторизация и создание профиля
  useEffect(() => {
    const auth = getAuth();
    setLoading(true);
    let unsub: any;

    unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Если пользователь уже авторизован, обрабатываем его профиль
          const dbProfile = await getUserProfile(firebaseUser.uid);
          
          // Проверяем, есть ли данные из Telegram и обновляем профиль при необходимости
          const tgUser = getTelegramData();
          if (tgUser) {
            // Обновляем профиль с данными из Telegram
            const profileData: Partial<User> = {
              displayName: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
              photoURL: tgUser.photo_url,
              telegramId: tgUser.id.toString(),
              username: tgUser.username,
            };
            
            await createOrUpdateUserProfile(firebaseUser.uid, profileData);
            // Перезагружаем профиль после обновления
            const updatedProfile = await getUserProfile(firebaseUser.uid);
            setProfile(updatedProfile);
            checkUserRole(updatedProfile);
          } else if (dbProfile) {
            // Если нет данных Telegram, но есть профиль - используем его
            setProfile(dbProfile);
            checkUserRole(dbProfile);
          } else if (firebaseUser.isAnonymous) {
            // Если это анонимный пользователь без профиля, создаем базовый профиль
            const profileData: Partial<User> = {
              id: firebaseUser.uid,
              displayName: 'Гость',
              createdAt: new Date()
            };
            await createOrUpdateUserProfile(firebaseUser.uid, profileData);
            const newProfile = await getUserProfile(firebaseUser.uid);
            setProfile(newProfile);
            checkUserRole(newProfile);
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Ошибка при обработке профиля пользователя:", error);
          setError(`Ошибка при обработке профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
          setLoading(false);
        }
      } else {
        // Если пользователь не авторизован, пытаемся авторизовать через Telegram
        try {
          const tgUser = getTelegramData();
          if (tgUser && !telegramAuthAttempted) {
            setTelegramAuthAttempted(true);
            console.log("Обнаружены данные Telegram, пытаемся аутентифицировать");
            
            // Аутентифицируем пользователя через Telegram
            const telegramAuthUser = await authenticateTelegramUser(tgUser);
            if (!telegramAuthUser) {
              // Если не удалось аутентифицировать через Telegram, используем анонимную аутентификацию
              console.log("Не удалось аутентифицировать через Telegram, используем анонимную аутентификацию");
              await signInAnonymously(auth);
            }
          } else if (!telegramAuthAttempted) {
            setTelegramAuthAttempted(true);
            console.log("Данные Telegram не обнаружены, используем анонимную аутентификацию");
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Ошибка при попытке аутентификации:", error);
          setError(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
          setLoading(false);
        }
      }
    }, (err) => {
      console.error("Ошибка Firebase Auth:", err);
      setError(`Ошибка авторизации: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [telegramAuthAttempted]);

  // Обновить профиль вручную
  const refreshProfile = async () => {
    if (user) {
      const dbProfile = await getUserProfile(user.uid);
      setProfile(dbProfile);
      checkUserRole(dbProfile);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      error, 
      refreshProfile,
      isAdmin,
      isSuperAdmin,
      isCompanyAdmin,
      adminCompanyId
    }}>
      {children}
    </UserContext.Provider>
  );
}; 