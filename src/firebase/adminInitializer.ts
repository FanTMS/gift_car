import { assignBomkooorAsSuperAdmin } from './userServices';

/**
 * Инициализирует суперадминистратора автоматически при запуске приложения в продакшн-режиме
 */
export const initializeSuperAdmin = async (): Promise<void> => {
  try {
    console.log('Попытка автоматического назначения суперадминистратора...');
    
    // Проверяем режим приложения - только продакшн режим
    if (process.env.NODE_ENV === 'production') {
      // Назначаем @bomkooor суперадминистратором
      const result = await assignBomkooorAsSuperAdmin();
      
      if (result) {
        console.log('Суперадминистратор @bomkooor успешно инициализирован');
      } else {
        console.error('Не удалось инициализировать суперадминистратора @bomkooor');
      }
    } else {
      console.log('Пропуск автоматической инициализации суперадминистратора в режиме разработки');
    }
  } catch (err) {
    console.error('Ошибка при инициализации суперадминистратора:', err);
  }
}; 