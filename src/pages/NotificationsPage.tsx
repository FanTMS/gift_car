import React from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemIcon, Badge, Divider, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Info as InfoIcon, 
  Check as CheckIcon, 
  Warning as WarningIcon, 
  Error as ErrorIcon,
  DeleteOutline as DeleteIcon,
  CheckCircleOutline as MarkReadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { Notification } from '../types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotifications();

  // Выбор иконки в зависимости от типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <NotificationsIcon color="primary" />;
    }
  };

  // Переход по ссылке из уведомления
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Проверка на наличие непрочитанных уведомлений
  const hasUnreadNotifications = notifications.some(notif => !notif.isRead);

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Уведомления
        </Typography>
        
        {hasUnreadNotifications && (
          <Button 
            variant="outlined" 
            startIcon={<MarkReadIcon />} 
            onClick={() => markAllAsRead()}
          >
            Отметить все как прочитанные
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">Нет уведомлений</Typography>
          <Typography color="textSecondary">
            У вас пока нет уведомлений. Они появятся здесь, когда они будут доступны.
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    cursor: notification.link ? 'pointer' : 'default',
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: notification.link ? 'rgba(0, 0, 0, 0.04)' : undefined
                    }
                  }}
                  onClick={() => notification.link && handleNotificationClick(notification)}
                >
                  <ListItemIcon>
                    {!notification.isRead ? (
                      <Badge color="primary" variant="dot">
                        {getNotificationIcon(notification.type)}
                      </Badge>
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {notification.createdAt?.toDate 
                            ? notification.createdAt.toDate().toLocaleDateString('ru-RU', {
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Недавно'}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex' }}>
                    {!notification.isRead && (
                      <Tooltip title="Отметить как прочитанное">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <MarkReadIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Удалить">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsPage; 