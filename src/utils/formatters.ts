/**
 * Форматирует дату в формат "ДД.ММ.ГГГГ"
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Форматирует временную метку в относительное время (например, "5 минут назад")
 */
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'только что';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getMinutesText(diffInMinutes)} назад`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${getHoursText(diffInHours)} назад`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${getDaysText(diffInDays)} назад`;
  }
  
  return formatDate(date);
};

/**
 * Возвращает правильную форму слова "минута" в зависимости от числа
 */
const getMinutesText = (minutes: number): string => {
  if (minutes % 10 === 1 && minutes % 100 !== 11) {
    return 'минуту';
  } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
    return 'минуты';
  } else {
    return 'минут';
  }
};

/**
 * Возвращает правильную форму слова "час" в зависимости от числа
 */
const getHoursText = (hours: number): string => {
  if (hours % 10 === 1 && hours % 100 !== 11) {
    return 'час';
  } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
    return 'часа';
  } else {
    return 'часов';
  }
};

/**
 * Возвращает правильную форму слова "день" в зависимости от числа
 */
const getDaysText = (days: number): string => {
  if (days % 10 === 1 && days % 100 !== 11) {
    return 'день';
  } else if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) {
    return 'дня';
  } else {
    return 'дней';
  }
}; 