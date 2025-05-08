/**
 * Утилиты для работы с датами
 */

/**
 * Форматирует дату в локализованную строку в формате ДД.ММ.ГГГГ
 * @param date - Объект типа Date или timestamp
 * @returns Отформатированная строка даты
 */
export const formatDate = (date: Date | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Форматирует дату и время в локализованную строку
 * @param date - Объект типа Date или timestamp
 * @returns Отформатированная строка даты и времени
 */
export const formatDateTime = (date: Date | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматирует относительную дату (например, "2 часа назад")
 * @param date - Объект типа Date или timestamp
 * @returns Строка с относительной датой
 */
export const formatRelativeTime = (date: Date | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Разница в секундах
  const diffSec = Math.floor(diffMs / 1000);
  
  // Меньше минуты
  if (diffSec < 60) {
    return 'только что';
  }
  
  // Разница в минутах
  const diffMin = Math.floor(diffSec / 60);
  
  // Меньше часа
  if (diffMin < 60) {
    return `${diffMin} ${pluralize(diffMin, 'минуту', 'минуты', 'минут')} назад`;
  }
  
  // Разница в часах
  const diffHours = Math.floor(diffMin / 60);
  
  // Меньше суток
  if (diffHours < 24) {
    return `${diffHours} ${pluralize(diffHours, 'час', 'часа', 'часов')} назад`;
  }
  
  // Разница в днях
  const diffDays = Math.floor(diffHours / 24);
  
  // Меньше недели
  if (diffDays < 7) {
    return `${diffDays} ${pluralize(diffDays, 'день', 'дня', 'дней')} назад`;
  }
  
  // Для более давних дат возвращаем обычный формат
  return formatDate(dateObj);
};

/**
 * Вспомогательная функция для правильного склонения слов
 * @param count - Число для которого нужно склонение
 * @param one - Форма слова для 1
 * @param few - Форма слова для 2-4
 * @param many - Форма слова для 5-20
 * @returns Правильная форма слова
 */
function pluralize(count: number, one: string, few: string, many: string): string {
  if (count % 10 === 1 && count % 100 !== 11) {
    return one;
  } else if (
    [2, 3, 4].includes(count % 10) &&
    ![12, 13, 14].includes(count % 100)
  ) {
    return few;
  } else {
    return many;
  }
} 