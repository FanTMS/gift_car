/**
 * Утилиты для работы с Telegram Mini App
 */

/**
 * Проверяет, запущено ли приложение в Telegram Mini App
 * @returns {boolean} true, если приложение запущено в Telegram
 */
export const isTelegramMiniApp = (): boolean => {
  return Boolean(window.Telegram?.WebApp);
};

/**
 * Возвращает данные пользователя из Telegram Mini App
 * @returns {any | null} Данные пользователя или null
 */
export const getTelegramUser = (): any => {
  try {
    if (window.Telegram?.WebApp) {
      // @ts-ignore - Используем Telegram API
      return window.Telegram.WebApp.initDataUnsafe?.user;
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя Telegram:', error);
  }
  return null;
};

/**
 * Инициализирует Telegram Mini App
 * @param {string} headerColor Цвет заголовка приложения
 */
export const initializeTelegramApp = (headerColor: string = '#1E88E5'): void => {
  try {
    if (window.Telegram?.WebApp) {
      // Сообщаем что приложение готово к работе
      window.Telegram.WebApp.ready();
      
      // Устанавливаем цвет заголовка
      window.Telegram.WebApp.setHeaderColor(headerColor);
      
      // Расширяем приложение на весь экран
      window.Telegram.WebApp.expand();
      
      console.log('Telegram Mini App успешно инициализировано');
    }
  } catch (error) {
    console.error('Ошибка при инициализации Telegram Mini App:', error);
  }
};

/**
 * Показывает сообщение в Telegram Mini App
 * @param {string} message Текст сообщения
 * @param {() => void} callback Функция обратного вызова
 */
export const showTelegramAlert = (message: string, callback?: () => void): void => {
  try {
    if (window.Telegram?.WebApp) {
      // @ts-ignore - Используем метод из Telegram API
      window.Telegram.WebApp.showAlert(message, callback);
    } else {
      // Запасной вариант для браузера
      alert(message);
      if (callback) callback();
    }
  } catch (error) {
    console.error('Ошибка при показе Telegram Alert:', error);
    // Запасной вариант
    alert(message);
    if (callback) callback();
  }
};

/**
 * Показывает диалог подтверждения в Telegram Mini App
 * @param {string} message Текст сообщения
 * @param {(result: boolean) => void} callback Функция обратного вызова с результатом
 */
export const showTelegramConfirm = (message: string, callback?: (result: boolean) => void): void => {
  try {
    if (window.Telegram?.WebApp) {
      // @ts-ignore - Используем метод из Telegram API
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      // Запасной вариант для браузера
      const result = window.confirm(message);
      if (callback) callback(result);
    }
  } catch (error) {
    console.error('Ошибка при показе Telegram Confirm:', error);
    // Запасной вариант
    const result = window.confirm(message);
    if (callback) callback(result);
  }
};

/**
 * Применяет стили Telegram к элементам интерфейса
 */
export const applyTelegramStyles = (): void => {
  try {
    if (window.Telegram?.WebApp) {
      document.body.classList.add('telegram-mini-app');
      
      // @ts-ignore - Получаем параметры темы из Telegram API
      const theme = window.Telegram.WebApp.themeParams;
      if (theme) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', theme.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
      }
    }
  } catch (error) {
    console.error('Ошибка при применении стилей Telegram:', error);
  }
}; 