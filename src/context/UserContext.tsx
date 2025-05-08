import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, signInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { createOrUpdateUserProfile, getUserProfile } from '../firebase/userServices';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

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

  // Получение данных Telegram из window.Telegram.WebApp.initDataUnsafe
  const getTelegramData = () => {
    try {
      if (
        window.Telegram &&
        window.Telegram.WebApp &&
        (window.Telegram.WebApp as any).initDataUnsafe
      ) {
        return (window.Telegram.WebApp as any).initDataUnsafe.user;
      }
    } catch (e) {}
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

  // Авторизация и создание профиля
  useEffect(() => {
    const auth = getAuth();
    setLoading(true);
    let unsub: any;

    unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Получаем Telegram данные
        const tgUser = getTelegramData();
        // Формируем профиль
        let profileData: User = {
          id: firebaseUser.uid,
        };
        if (tgUser) {
          profileData = {
            ...profileData,
            displayName: tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : ''),
            photoURL: tgUser.photo_url,
            telegramId: tgUser.id,
            username: tgUser.username,
          };
        } else if (firebaseUser.isAnonymous) {
          profileData = {
            ...profileData,
            displayName: 'Гость',
          };
        }
        try {
          // Создаём или обновляем профиль в базе
          await createOrUpdateUserProfile(firebaseUser.uid, profileData);
          // Загружаем профиль
          const dbProfile = await getUserProfile(firebaseUser.uid);
          
          // Устанавливаем профиль и проверяем роль
          setProfile(dbProfile);
          checkUserRole(dbProfile);
        } catch (error) {
          console.error("Ошибка при создании профиля пользователя:", error);
          setError(`Ошибка при создании профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
        setLoading(false);
      } else {
        // Если не авторизован — пробуем Telegram, иначе анонимно
        try {
          const tgUser = getTelegramData();
          if (tgUser) {
            // Можно реализовать кастомную авторизацию через Firebase Functions (advanced),
            // но для MVP — просто анонимно + сохраняем Telegram данные в профиле
            await signInAnonymously(auth);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Ошибка анонимной авторизации:", error);
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
  }, []);

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