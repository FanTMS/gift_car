import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCompanies, 
  getRafflesByCompany, 
  getActiveRaffles, 
  getAllCarFeatures,
  createCompany,
  updateCompany,
  deleteCompany,
  createRaffle,
  updateRaffle,
  deleteRaffle,
  getAppSettings,
  updateAppSettings,
  toggleFavoriteRaffle
} from '../firebase/services';
import { Company, Raffle, CarFeature, AppSettings } from '../types';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  addDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { db } from '../firebase/config';

interface FirebaseContextType {
  user: User | null;
  profile: User | null;
  companies: Company[];
  activeCompany: Company | null;
  raffles: Raffle[];
  carFeatures: CarFeature[];
  appSettings: AppSettings | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  setActiveCompany: (company: Company) => void;
  refreshData: () => Promise<void>;
  // Company management
  addCompany: (company: Omit<Company, 'id'>) => Promise<{ id: string }>;
  editCompany: (companyId: string, data: Partial<Company>) => Promise<boolean>;
  removeCompany: (companyId: string) => Promise<boolean>;
  // Raffle management
  addRaffle: (raffle: Omit<Raffle, 'id'>) => Promise<{ id: string }>;
  editRaffle: (raffleId: string, data: Partial<Raffle>) => Promise<boolean>;
  removeRaffle: (raffleId: string) => Promise<boolean>;
  // App Settings
  updateSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  // Favorites management
  updateFavoriteStatus: (raffleId: string, isFavorite: boolean) => Promise<boolean>;
  // New methods
  getCompanies: () => Promise<Company[]>;
  getCompanyById: (id: string) => Promise<Company | null>;
  getRaffles: () => Promise<Raffle[]>;
  getRafflesByCompany: (companyId: string) => Promise<Raffle[]>;
  getRaffleById: (id: string) => Promise<Raffle | null>;
  getRaffleParticipants: (raffleId: string) => Promise<any[]>;
  getRaffleWinners: (raffleId: string) => Promise<any[]>;
  getAllCarFeatures: () => Promise<CarFeature[]>;
  getCarFeatureById: (id: string) => Promise<CarFeature | null>;
  // Wallet methods
  getUserBalance: (userId: string) => Promise<number>;
  updateUserBalance: (userId: string, amount: number, operation: 'add' | 'subtract') => Promise<boolean>;
  createTransaction: (transactionData: any) => Promise<{ id: string }>;
  getUserTransactions: (userId: string) => Promise<any[]>;
  getAllTransactions: (limit?: number) => Promise<any[]>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [carFeatures, setCarFeatures] = useState<CarFeature[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies
      const companiesData = await getCompanies();
      console.log("Загружены компании:", companiesData);
      setCompanies(companiesData);
      
      // Set main company as active or first company if no main company
      const mainCompany = companiesData.find(c => c.isMain) || companiesData[0];
      if (mainCompany) {
        setActiveCompany(mainCompany);
        
        // Fetch raffles for the active company
        const rafflesData = await getRafflesByCompany(mainCompany.id);
        console.log("Загружены розыгрыши для компании:", rafflesData);
        setRaffles(rafflesData as Raffle[]);
      } else {
        // If no companies exist, fetch all active raffles
        const activeRaffles = await getActiveRaffles();
        console.log("Загружены активные розыгрыши:", activeRaffles);
        setRaffles(activeRaffles as Raffle[]);
      }
      
      // Fetch car features
      const featuresData = await getAllCarFeatures();
      setCarFeatures(featuresData);
      
      // Fetch app settings
      const settings = await getAppSettings();
      setAppSettings(settings);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка загрузки данных: ', err);
      setError(`Ошибка загрузки данных: ${errorMessage}. Пожалуйста, попробуйте позже.`);
    } finally {
      setLoading(false);
    }
  };

  // Load raffles for the selected company
  const loadRafflesForCompany = async (company: Company) => {
    try {
      setLoading(true);
      const rafflesData = await getRafflesByCompany(company.id);
      console.log("Загружены розыгрыши для компании:", company.id, rafflesData);
      setRaffles(rafflesData as Raffle[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Ошибка загрузки розыгрышей: ', err);
      setError(`Ошибка загрузки розыгрышей: ${errorMessage}. Пожалуйста, попробуйте позже.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle company selection
  const handleSetActiveCompany = (company: Company) => {
    setActiveCompany(company);
    loadRafflesForCompany(company);
  };

  // Company management
  const addCompany = async (company: Omit<Company, 'id'>) => {
    const result = await createCompany(company);
    await refreshData();
    return result;
  };

  const editCompany = async (companyId: string, data: Partial<Company>) => {
    const result = await updateCompany(companyId, data);
    await refreshData();
    return result;
  };

  const removeCompany = async (companyId: string) => {
    const result = await deleteCompany(companyId);
    await refreshData();
    return result;
  };

  // Raffle management
  const addRaffle = async (raffle: Omit<Raffle, 'id'>) => {
    const result = await createRaffle(raffle);
    await refreshData();
    return result;
  };

  const editRaffle = async (raffleId: string, data: Partial<Raffle>) => {
    const result = await updateRaffle(raffleId, data);
    await refreshData();
    return result;
  };

  const removeRaffle = async (raffleId: string) => {
    const result = await deleteRaffle(raffleId);
    await refreshData();
    return result;
  };

  // App settings management
  const updateSettings = async (settings: Partial<AppSettings>) => {
    const result = await updateAppSettings(settings);
    if (result) {
      await refreshData();
    }
    return result;
  };

  // Refresh all data
  const refreshData = async () => {
    await loadInitialData();
  };

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Check user role
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        checkUserRole(currentUser.uid);
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Обновляем профиль при изменении пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setProfile(userDoc.data() as User);
          }
        } catch (err) {
          console.error("Ошибка при загрузке профиля пользователя:", err);
        }
      } else {
        setProfile(null);
      }
    };

    loadUserProfile();
  }, [user]);

  const checkUserRole = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Ошибка при проверке роли пользователя:", err);
      setIsAdmin(false);
    }
  };

  // New methods
  const getCompanies = async (): Promise<Company[]> => {
    try {
      const companiesCollection = collection(db, 'companies');
      const companiesSnapshot = await getDocs(companiesCollection);
      
      return companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));
    } catch (err) {
      console.error("Ошибка при получении компаний:", err);
      return [];
    }
  };

  const getCompanyById = async (id: string): Promise<Company | null> => {
    try {
      const companyDocRef = doc(db, 'companies', id);
      const companyDoc = await getDoc(companyDocRef);
      
      if (companyDoc.exists()) {
        return {
          id: companyDoc.id,
          ...companyDoc.data()
        } as Company;
      }
      
      return null;
    } catch (err) {
      console.error("Ошибка при получении компании:", err);
      return null;
    }
  };

  const getRaffles = async (): Promise<Raffle[]> => {
    try {
      const rafflesCollection = collection(db, 'raffles');
      const rafflesSnapshot = await getDocs(rafflesCollection);
      
      return rafflesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Raffle));
    } catch (err) {
      console.error("Ошибка при получении розыгрышей:", err);
      return [];
    }
  };

  const getRafflesByCompany = async (companyId: string): Promise<Raffle[]> => {
    try {
      const rafflesQuery = query(
        collection(db, 'raffles'),
        where('companyId', '==', companyId)
      );
      
      const rafflesSnapshot = await getDocs(rafflesQuery);
      
      return rafflesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Raffle));
    } catch (err) {
      console.error("Ошибка при получении розыгрышей компании:", err);
      return [];
    }
  };

  const getRaffleById = async (id: string): Promise<Raffle | null> => {
    try {
      const raffleDocRef = doc(db, 'raffles', id);
      const raffleDoc = await getDoc(raffleDocRef);
      
      if (raffleDoc.exists()) {
        return {
          id: raffleDoc.id,
          ...raffleDoc.data()
        } as Raffle;
      }
      
      return null;
    } catch (err) {
      console.error("Ошибка при получении розыгрыша:", err);
      return null;
    }
  };

  const getRaffleParticipants = async (raffleId: string): Promise<any[]> => {
    try {
      const participantsQuery = query(
        collection(db, 'tickets'),
        where('raffleId', '==', raffleId),
        orderBy('purchaseDate', 'desc'),
        limit(20)
      );
      
      const participantsSnapshot = await getDocs(participantsQuery);
      
      // Получение пользователей по их ID
      const participants = await Promise.all(
        participantsSnapshot.docs.map(async (ticketDoc) => {
          const ticketData = ticketDoc.data();
          
          // Получение данных пользователя
          const userDocRef = doc(db, 'users', ticketData.userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Форматирование даты покупки
            const purchaseDateObj = ticketData.purchaseDate?.toDate();
            let timeString = '';
            
            if (purchaseDateObj) {
              const now = new Date();
              const diffMs = now.getTime() - purchaseDateObj.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              
              if (diffMins < 60) {
                timeString = `${diffMins} минут назад`;
              } else if (diffMins < 1440) {
                const hours = Math.floor(diffMins / 60);
                timeString = `${hours} часов назад`;
              } else {
                const days = Math.floor(diffMins / 1440);
                timeString = `${days} дней назад`;
              }
            }
            
            return {
              id: ticketDoc.id,
              name: userData.displayName || `Пользователь ${userData.uid.substring(0, 4)}`,
              avatar: userData.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg',
              tickets: ticketData.quantity || 1,
              time: timeString
            };
          }
          
          return null;
        })
      );
      
      // Фильтрация null значений
      return participants.filter(Boolean);
    } catch (err) {
      console.error("Ошибка при получении участников розыгрыша:", err);
      return [];
    }
  };

  const getRaffleWinners = async (raffleId: string): Promise<any[]> => {
    try {
      const winnersQuery = query(
        collection(db, 'winners'),
        where('raffleId', '==', raffleId)
      );
      
      const winnersSnapshot = await getDocs(winnersQuery);
      
      // Получение пользователей по их ID и информации о розыгрыше
      const winners = await Promise.all(
        winnersSnapshot.docs.map(async (winnerDoc) => {
          const winnerData = winnerDoc.data();
          
          // Получение данных пользователя
          const userDocRef = doc(db, 'users', winnerData.userId);
          const userDoc = await getDoc(userDocRef);
          
          // Получение данных розыгрыша
          const raffleDocRef = doc(db, 'raffles', winnerData.raffleId);
          const raffleDoc = await getDoc(raffleDocRef);
          
          if (userDoc.exists() && raffleDoc.exists()) {
            const userData = userDoc.data();
            const raffleData = raffleDoc.data();
            
            // Форматирование даты выигрыша
            const winDateObj = winnerData.winDate?.toDate();
            let dateString = '';
            
            if (winDateObj) {
              dateString = winDateObj.toLocaleDateString('ru-RU');
            }
            
            return {
              id: winnerDoc.id,
              name: userData.displayName || `Пользователь ${userData.uid.substring(0, 4)}`,
              avatar: userData.photoURL || 'https://randomuser.me/api/portraits/men/15.jpg',
              car: raffleData.title,
              date: dateString
            };
          }
          
          return null;
        })
      );
      
      // Фильтрация null значений
      return winners.filter(Boolean);
    } catch (err) {
      console.error("Ошибка при получении победителей розыгрыша:", err);
      return [];
    }
  };

  // New methods
  const getAllCarFeatures = async (): Promise<CarFeature[]> => {
    try {
      const featuresCollection = collection(db, 'carFeatures');
      const featuresSnapshot = await getDocs(featuresCollection);
      
      return featuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CarFeature));
    } catch (err) {
      console.error("Ошибка при получении особенностей автомобиля:", err);
      return [];
    }
  };

  const getCarFeatureById = async (id: string): Promise<CarFeature | null> => {
    try {
      const featureDocRef = doc(db, 'carFeatures', id);
      const featureDoc = await getDoc(featureDocRef);
      
      if (featureDoc.exists()) {
        return {
          id: featureDoc.id,
          ...featureDoc.data()
        } as CarFeature;
      }
      
      return null;
    } catch (err) {
      console.error("Ошибка при получении особенности автомобиля:", err);
      return null;
    }
  };

  // Обновляем метод для работы с избранным
  const updateFavoriteStatus = async (raffleId: string, isFavorite: boolean): Promise<boolean> => {
    try {
      if (!user) {
        // Если пользователь не авторизован, сохраняем только в localStorage
        return true;
      }

      // Обновляем избранное в базе данных
      const result = await toggleFavoriteRaffle(raffleId, user.uid, isFavorite);
      
      if (result) {
        // Обновляем локальное состояние розыгрышей
        setRaffles(prevRaffles => {
          return prevRaffles.map(raffle => {
            if (raffle.id === raffleId) {
              return {
                ...raffle,
                isFavorited: isFavorite
              };
            }
            return raffle;
          });
        });
      }
      
      return result;
    } catch (error) {
      console.error("Ошибка при обновлении статуса избранного:", error);
      return false;
    }
  };

  // Wallet methods
  const getUserBalance = async (userId: string): Promise<number> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().balance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Ошибка при получении баланса пользователя:', error);
      return 0;
    }
  };
  
  const updateUserBalance = async (userId: string, amount: number, operation: 'add' | 'subtract'): Promise<boolean> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('Пользователь не найден');
      }
      
      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;
      
      // Вычисляем новый баланс
      let newBalance = currentBalance;
      if (operation === 'add') {
        newBalance = currentBalance + amount;
      } else {
        newBalance = Math.max(0, currentBalance - amount);
      }
      
      // Обновляем баланс пользователя
      await updateDoc(userDocRef, {
        balance: newBalance,
        updatedAt: Timestamp.now()
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении баланса пользователя:', error);
      return false;
    }
  };
  
  const createTransaction = async (transactionData: any): Promise<{ id: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transactionData,
        createdAt: Timestamp.now()
      });
      
      return { id: docRef.id };
    } catch (error) {
      console.error('Ошибка при создании транзакции:', error);
      throw error;
    }
  };
  
  const getUserTransactions = async (userId: string): Promise<any[]> => {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Ошибка при получении транзакций пользователя:', error);
      return [];
    }
  };
  
  const getAllTransactions = async (limitCount = 100): Promise<any[]> => {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(transactionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Ошибка при получении всех транзакций:', error);
      return [];
    }
  };

  const value = {
    user,
    profile,
    companies,
    activeCompany,
    raffles,
    carFeatures,
    appSettings,
    loading,
    error,
    isAdmin,
    setActiveCompany: handleSetActiveCompany,
    refreshData,
    // Company management
    addCompany,
    editCompany,
    removeCompany,
    // Raffle management
    addRaffle,
    editRaffle,
    removeRaffle,
    // App Settings
    updateSettings,
    // Favorites management
    updateFavoriteStatus,
    // New methods
    getCompanies,
    getCompanyById,
    getRaffles,
    getRafflesByCompany,
    getRaffleById,
    getRaffleParticipants,
    getRaffleWinners,
    getAllCarFeatures,
    getCarFeatureById,
    // Wallet methods
    getUserBalance,
    updateUserBalance,
    createTransaction,
    getUserTransactions,
    getAllTransactions
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}; 