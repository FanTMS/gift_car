import { db } from './config';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { User } from '../types';

export const usersCollection = collection(db, 'users');

// Получить профиль пользователя
export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() };
  } else {
    return null;
  }
};

// Создать или обновить профиль пользователя
export const createOrUpdateUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
};

// Обновить профиль пользователя (только указанные поля)
export const updateUserProfile = async (uid: string, data: any) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

// Получить список всех пользователей
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (err) {
    console.error("Ошибка при получении списка пользователей:", err);
    return [];
  }
};

// Получить список администраторов
export const getAdmins = async (): Promise<User[]> => {
  try {
    const adminsQuery = query(
      collection(db, 'users'),
      where('role', 'in', ['admin', 'superadmin']),
      orderBy('createdAt', 'desc')
    );
    
    const adminsSnapshot = await getDocs(adminsQuery);
    return adminsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (err) {
    console.error("Ошибка при получении списка администраторов:", err);
    return [];
  }
};

// Найти пользователя по Telegram ID
export const findUserByTelegramId = async (telegramId: string | number): Promise<User | null> => {
  try {
    // Преобразуем telegramId в строку, если он передан как число
    const telegramIdStr = telegramId.toString();
    
    console.log(`Ищем пользователя по Telegram ID: ${telegramIdStr}`);
    
    const userQuery = query(
      collection(db, 'users'),
      where('telegramId', '==', telegramIdStr)
    );
    
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      console.log(`Пользователь найден с ID: ${userDoc.id}`);
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    
    console.log('Пользователь не найден по Telegram ID');
    return null;
  } catch (err) {
    console.error("Ошибка при поиске пользователя по Telegram ID:", err);
    return null;
  }
};

// Назначить пользователя администратором
export const assignAdminRole = async (userId: string, role: 'admin' | 'superadmin', companyId?: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userData: any = {
      role: role,
      updatedAt: new Date()
    };
    
    // Если указан ID компании и роль admin (не superadmin), добавляем ID компании
    if (companyId && role === 'admin') {
      userData.companyId = companyId;
    } else {
      // Для суперадмина удаляем привязку к компании
      userData.companyId = null;
    }
    
    await updateDoc(userRef, userData);
    return true;
  } catch (err) {
    console.error("Ошибка при назначении роли администратора:", err);
    return false;
  }
};

// Удалить роль администратора
export const removeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: 'user',
      companyId: null,
      updatedAt: new Date()
    });
    return true;
  } catch (err) {
    console.error("Ошибка при удалении роли администратора:", err);
    return false;
  }
};

// Функция для назначения пользователя суперадминистратором при локальной разработке
export const assignSuperAdminForLocalDev = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error('Пользователь не найден при попытке назначения суперадминистратора');
      return false;
    }
    
    // Назначаем роль суперадминистратора
    await updateDoc(userRef, {
      role: 'superadmin',
      updatedAt: Timestamp.now(),
      // Удаляем привязку к компании, если она была
      companyId: null,
      // Добавляем метку локальной разработки
      isLocalDev: true
    });
    
    console.log('Пользователь успешно назначен суперадминистратором для локальной разработки:', uid);
    return true;
  } catch (err) {
    console.error('Ошибка при назначении суперадминистратора для локальной разработки:', err);
    return false;
  }
};

// Функция для назначения @bomkooor суперадминистратором
export const assignBomkooorAsSuperAdmin = async (): Promise<boolean> => {
  try {
    // Ищем пользователя с Telegram username bomkooor
    const userQuery = query(
      collection(db, 'users'),
      where('username', '==', 'bomkooor')
    );
    
    const userSnapshot = await getDocs(userQuery);
    
    // Если пользователь не найден по username, ищем по displayName
    if (userSnapshot.empty) {
      console.log('Пользователь @bomkooor не найден по username, ищем по другим полям...');
      
      // Поиск по части displayName
      const displayNameQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', 'bomkooor'),
        where('displayName', '<=', 'bomkooor\uf8ff')
      );
      
      const displayNameSnapshot = await getDocs(displayNameQuery);
      
      if (displayNameSnapshot.empty) {
        console.error('Пользователь @bomkooor не найден ни по username, ни по displayName');
        return false;
      }
      
      // Назначаем права для найденного пользователя
      const userDoc = displayNameSnapshot.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'superadmin',
        updatedAt: Timestamp.now(),
        companyId: null
      });
      
      console.log('Пользователь @bomkooor успешно назначен суперадминистратором (найден по displayName)');
      return true;
    }
    
    // Назначаем права суперадминистратора
    const userDoc = userSnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'superadmin',
      updatedAt: Timestamp.now(),
      companyId: null
    });
    
    console.log('Пользователь @bomkooor успешно назначен суперадминистратором');
    return true;
  } catch (err) {
    console.error('Ошибка при назначении @bomkooor суперадминистратором:', err);
    return false;
  }
}; 