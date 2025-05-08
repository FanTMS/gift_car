import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Tooltip, useTheme } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getUnreadNotificationsCount } from '../firebase/services';

const NotificationBell: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const count = await getUnreadNotificationsCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();

    // Обновлять счетчик каждые 60 секунд
    const intervalId = setInterval(fetchUnreadCount, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <Tooltip title="Уведомления">
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        sx={{
          color: theme.palette.mode === 'light' ? 'text.primary' : '#fff',
          background: 'transparent',
          '&:hover': {
            background: theme.palette.mode === 'light' 
              ? 'rgba(0, 0, 0, 0.1)' 
              : 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          invisible={unreadCount === 0}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell; 