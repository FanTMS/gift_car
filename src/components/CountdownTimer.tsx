import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AccessTime } from '@mui/icons-material';

interface CountdownTimerProps {
  endDate: Date | number | string | any; // Расширил тип для поддержки Timestamp
  onComplete?: () => void;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const TimerContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size?: 'small' | 'medium' | 'large' }>(({ theme, size = 'medium' }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(2),
  padding: size === 'small' ? theme.spacing(1, 2) : (size === 'medium' ? theme.spacing(2, 3) : theme.spacing(3, 4)),
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  backgroundColor: theme.palette.background.paper,
}));

const TimeSegment = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: theme.spacing(0, 1),
  minWidth: '3.5rem',
}));

const TimeValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size?: 'small' | 'medium' | 'large' }>(({ theme, size = 'medium' }) => ({
  fontWeight: 700,
  fontSize: size === 'small' ? '1.2rem' : (size === 'medium' ? '1.8rem' : '2.5rem'),
  lineHeight: 1.2,
  color: theme.palette.primary.main,
}));

const TimeLabel = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size?: 'small' | 'medium' | 'large' }>(({ theme, size = 'medium' }) => ({
  fontSize: size === 'small' ? '0.7rem' : (size === 'medium' ? '0.85rem' : '1rem'),
  color: theme.palette.text.secondary,
}));

const TimerIcon = styled(AccessTime, {
  shouldForwardProp: (prop) => prop !== 'size'
})<{ size?: 'small' | 'medium' | 'large' }>(({ theme, size = 'medium' }) => ({
  color: theme.palette.primary.main,
  fontSize: size === 'small' ? '1.2rem' : (size === 'medium' ? '1.5rem' : '2rem'),
  marginRight: theme.spacing(1),
}));

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  endDate, 
  onComplete, 
  showLabels = true,
  size = 'medium'
}) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      let targetDate: Date;
      
      // Обработка различных типов даты, включая Firebase Timestamp
      if (typeof endDate === 'string') {
        targetDate = new Date(endDate);
      } else if (endDate instanceof Date) {
        targetDate = endDate;
      } else if (typeof endDate === 'number') {
        targetDate = new Date(endDate);
      } else if (endDate && endDate.seconds && endDate.nanoseconds) {
        // Обработка Firebase Timestamp
        targetDate = new Date(endDate.seconds * 1000);
      } else if (endDate && typeof endDate.toDate === 'function') {
        // Если endDate является объектом Firestore Timestamp с методом toDate()
        targetDate = endDate.toDate();
      } else {
        // Если передано некорректное значение, используем текущую дату + 1 день
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsComplete(true);
        if (onComplete) onComplete();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      return { days, hours, minutes, seconds };
    };
    
    // Рассчитываем начальное значение
    setTimeLeft(calculateTimeLeft());
    
    // Запускаем интервал для обновления таймера
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    // Очистка при размонтировании
    return () => clearInterval(timer);
  }, [endDate, onComplete]);
  
  // Форматирование числа с добавлением ведущего нуля
  const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
  };
  
  if (isComplete) {
    return (
      <TimerContainer size={size}>
        <Typography color="error" variant={size === 'small' ? 'body2' : 'body1'} sx={{ fontWeight: 600 }}>
          Розыгрыш завершен
        </Typography>
      </TimerContainer>
    );
  }
  
  return (
    <TimerContainer size={size}>
      <TimerIcon size={size} />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {timeLeft.days > 0 && (
          <TimeSegment>
            <TimeValue size={size}>{formatNumber(timeLeft.days)}</TimeValue>
            {showLabels && <TimeLabel size={size}>дней</TimeLabel>}
          </TimeSegment>
        )}
        
        <TimeSegment>
          <TimeValue size={size}>{formatNumber(timeLeft.hours)}</TimeValue>
          {showLabels && <TimeLabel size={size}>часов</TimeLabel>}
        </TimeSegment>
        
        <TimeSegment>
          <TimeValue size={size}>{formatNumber(timeLeft.minutes)}</TimeValue>
          {showLabels && <TimeLabel size={size}>минут</TimeLabel>}
        </TimeSegment>
        
        <TimeSegment>
          <TimeValue size={size}>{formatNumber(timeLeft.seconds)}</TimeValue>
          {showLabels && <TimeLabel size={size}>секунд</TimeLabel>}
        </TimeSegment>
      </Box>
    </TimerContainer>
  );
};

export default CountdownTimer; 