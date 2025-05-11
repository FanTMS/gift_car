import { db } from './config';
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  Timestamp,
  limit,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { Company, Raffle, CarFeature, CarSpecifications, AppSettings, Notification, Winner } from '../types';

// Collections
export const companiesCollection = collection(db, 'companies');
export const rafflesCollection = collection(db, 'raffles');
export const carFeaturesCollection = collection(db, 'carFeatures');
export const appSettingsCollection = collection(db, 'appSettings');
export const notificationsCollection = collection(db, 'notifications');
export const winnersCollection = collection(db, 'winners');

// Get all companies
export const getCompanies = async () => {
  try {
    const snapshot = await getDocs(companiesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[];
  } catch (error) {
    console.error('Ошибка при получении списка компаний:', error);
    throw error;
  }
};

// Get a specific company
export const getCompany = async (companyId: string) => {
  try {
    const docRef = doc(db, 'companies', companyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Company;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Ошибка при получении компании ${companyId}:`, error);
    throw error;
  }
};

// Create a new company
export const createCompany = async (company: Omit<Company, 'id'>) => {
  const docRef = await addDoc(companiesCollection, {
    ...company,
    createdAt: Timestamp.now()
  });
  
  return { id: docRef.id };
};

// Update a company
export const updateCompany = async (companyId: string, data: Partial<Company>) => {
  const docRef = doc(db, 'companies', companyId);
  await updateDoc(docRef, data);
  
  return true;
};

// Delete a company
export const deleteCompany = async (companyId: string) => {
  const docRef = doc(db, 'companies', companyId);
  await deleteDoc(docRef);
  
  return true;
};

// Get raffles by company ID
export const getRafflesByCompany = async (companyId: string) => {
  const q = query(
    rafflesCollection, 
    where('companyId', '==', companyId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Raffle[];
};

// Get all active raffles
export const getActiveRaffles = async () => {
  const q = query(
    rafflesCollection,
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Raffle[];
};

// Get a specific raffle
export const getRaffle = async (raffleId: string) => {
  const docRef = doc(db, 'raffles', raffleId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Raffle;
  } else {
    return null;
  }
};

// Create a new raffle
export const createRaffle = async (raffle: Omit<Raffle, 'id'>) => {
  const docRef = await addDoc(rafflesCollection, {
    ...raffle,
    createdAt: Timestamp.now()
  });
  
  return { id: docRef.id };
};

// Update a raffle
export const updateRaffle = async (raffleId: string, data: Partial<Raffle>) => {
  const docRef = doc(db, 'raffles', raffleId);
  await updateDoc(docRef, data);
  
  return true;
};

// Delete a raffle
export const deleteRaffle = async (raffleId: string) => {
  const docRef = doc(db, 'raffles', raffleId);
  await deleteDoc(docRef);
  
  return true;
};

// Get winners for a raffle
export const getRaffleWinners = async (raffleId: string) => {
  const q = query(
    winnersCollection,
    where('raffleId', '==', raffleId),
    orderBy('place', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Add a winner to a raffle
export const addRaffleWinner = async (winner: Omit<Winner, 'id'>) => {
  const docRef = await addDoc(winnersCollection, {
    ...winner,
    winDate: Timestamp.now()
  });
  
  return { id: docRef.id };
};

// Update a winner
export const updateWinner = async (winnerId: string, data: Partial<Winner>) => {
  const docRef = doc(db, 'winners', winnerId);
  await updateDoc(docRef, data);
  
  return true;
};

// Delete a winner
export const deleteWinner = async (winnerId: string) => {
  const docRef = doc(db, 'winners', winnerId);
  await deleteDoc(docRef);
  
  return true;
};

// Car features management
export const getAllCarFeatures = async () => {
  const snapshot = await getDocs(carFeaturesCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CarFeature[];
};

export const createCarFeature = async (feature: Omit<CarFeature, 'id'>) => {
  const docRef = await addDoc(carFeaturesCollection, feature);
  return { id: docRef.id };
};

export const updateCarFeature = async (featureId: string, data: Partial<CarFeature>) => {
  const docRef = doc(db, 'carFeatures', featureId);
  await updateDoc(docRef, data);
  
  return true;
};

export const deleteCarFeature = async (featureId: string) => {
  const docRef = doc(db, 'carFeatures', featureId);
  await deleteDoc(docRef);
  
  return true;
};

// App Settings
export const getAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const q = query(appSettingsCollection, limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const settingsDoc = querySnapshot.docs[0];
    return { id: settingsDoc.id, ...settingsDoc.data() } as AppSettings;
  } catch (error) {
    console.error('Ошибка получения настроек приложения:', error);
    throw error;
  }
};

export const updateAppSettings = async (settingsData: Partial<AppSettings>): Promise<boolean> => {
  try {
    // Проверяем, существуют ли настройки
    const settings = await getAppSettings();
    
    if (settings) {
      // Обновляем существующие настройки
      const settingsRef = doc(appSettingsCollection, settings.id);
      await updateDoc(settingsRef, {
        ...settingsData,
        updatedAt: Timestamp.now()
      });
    } else {
      // Создаем новые настройки
      await addDoc(appSettingsCollection, {
        appName: settingsData.appName || 'АвтоШанс',
        logoUrl: settingsData.logoUrl || '',
        heroImageUrl: settingsData.heroImageUrl || '',
        primaryColor: settingsData.primaryColor || '#1976D2',
        secondaryColor: settingsData.secondaryColor || '#2196F3',
        contactEmail: settingsData.contactEmail || '',
        contactPhone: settingsData.contactPhone || '',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка обновления настроек приложения:', error);
    return false;
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Notification[];
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.length;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const docRef = doc(db, 'notifications', notificationId);
  await updateDoc(docRef, { isRead: true });
  
  return true;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(
    notificationsCollection,
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { isRead: true });
  });
  
  await batch.commit();
  return true;
};

// Create a notification
export const createNotification = async (notification: Omit<Notification, 'id'>) => {
  const docRef = await addDoc(notificationsCollection, {
    ...notification,
    createdAt: Timestamp.now(),
    isRead: false
  });
  
  return { id: docRef.id };
};

// Delete a notification
export const deleteNotification = async (notificationId: string) => {
  const docRef = doc(db, 'notifications', notificationId);
  await deleteDoc(docRef);
  
  return true;
};

// Favorites management
export const toggleFavoriteRaffle = async (raffleId: string, userId: string, isFavorite: boolean) => {
  try {
    const userFavoritesRef = doc(db, 'userFavorites', userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);

    if (userFavoritesDoc.exists()) {
      // Обновляем существующий документ
      const favorites = userFavoritesDoc.data().favorites || [];
      
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = [...favorites, raffleId];
      } else {
        updatedFavorites = favorites.filter((id: string) => id !== raffleId);
      }
      
      await updateDoc(userFavoritesRef, { favorites: updatedFavorites });
    } else {
      // Создаем новый документ
      await setDoc(userFavoritesRef, { 
        favorites: isFavorite ? [raffleId] : [],
        userId,
        createdAt: Timestamp.now()
      });
    }

    // Обновляем счетчик в розыгрыше
    const raffleRef = doc(db, 'raffles', raffleId);
    const raffleDoc = await getDoc(raffleRef);
    
    if (raffleDoc.exists()) {
      const favoritesCount = (raffleDoc.data().favoritesCount || 0) + (isFavorite ? 1 : -1);
      await updateDoc(raffleRef, { 
        favoritesCount: Math.max(0, favoritesCount),
        isFavorited: false // Сброс системного флага
      });
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при обновлении избранного:', error);
    return false;
  }
};

export const getUserFavorites = async (userId: string) => {
  try {
    const userFavoritesRef = doc(db, 'userFavorites', userId);
    const userFavoritesDoc = await getDoc(userFavoritesRef);
    
    if (userFavoritesDoc.exists()) {
      return userFavoritesDoc.data().favorites || [];
    }
    
    return [];
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    return [];
  }
};

export const getFavoriteRaffles = async (userId: string) => {
  try {
    const favorites = await getUserFavorites(userId);
    
    if (favorites.length === 0) {
      return [];
    }
    
    // Получаем все розыгрыши из избранного
    const q = query(
      rafflesCollection,
      where('id', 'in', favorites)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isFavorited: true // Помечаем как избранное
    })) as Raffle[];
  } catch (error) {
    console.error('Ошибка при получении избранных розыгрышей:', error);
    return [];
  }
} 