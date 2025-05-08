import { getAuth, signInAnonymously } from 'firebase/auth';
import { assignSuperAdminForLocalDev } from '../firebase/userServices';

/**
 * Утилита для быстрой авторизации с правами суперадминистратора в режиме разработки
 * ВНИМАНИЕ: Использовать только в режиме разработки!
 */
export const authAsSuperAdmin = async (): Promise<void> => {
  try {
    // Проверка, что мы в режиме разработки
    if (process.env.NODE_ENV !== 'development') {
      console.error('Функция authAsSuperAdmin доступна только в режиме разработки!');
      return;
    }
    
    const auth = getAuth();
    
    // Анонимная авторизация
    const { user } = await signInAnonymously(auth);
    
    if (!user) {
      throw new Error('Не удалось выполнить анонимную авторизацию');
    }
    
    console.log('Анонимная авторизация выполнена успешно:', user.uid);
    
    // Назначаем пользователя суперадминистратором
    const success = await assignSuperAdminForLocalDev(user.uid);
    
    if (success) {
      console.log('Авторизация с правами суперадминистратора выполнена успешно!');
      console.log('UID пользователя:', user.uid);
      
      // Сохраняем флаг в localStorage для удобства разработки
      localStorage.setItem('devSuperAdmin', 'true');
      localStorage.setItem('devSuperAdminUid', user.uid);
      
      // Перезагружаем страницу для применения изменений
      window.location.reload();
    } else {
      console.error('Не удалось назначить права суперадминистратора');
    }
  } catch (error) {
    console.error('Ошибка при авторизации с правами суперадминистратора:', error);
  }
};

/**
 * Проверка, авторизован ли пользователь как суперадминистратор для разработки
 */
export const isDevSuperAdmin = (): boolean => {
  return localStorage.getItem('devSuperAdmin') === 'true';
};

/**
 * Получение UID суперадминистратора для разработки
 */
export const getDevSuperAdminUid = (): string | null => {
  return localStorage.getItem('devSuperAdminUid');
};

/**
 * Выход из режима суперадминистратора для разработки
 */
export const logoutDevSuperAdmin = (): void => {
  localStorage.removeItem('devSuperAdmin');
  localStorage.removeItem('devSuperAdminUid');
  
  // Перезагружаем страницу для применения изменений
  window.location.reload();
}; 