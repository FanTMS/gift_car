import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import TelegramWalletConnect from '../../components/wallet/TelegramWalletConnect';
import { motion } from 'framer-motion';
import { CodeRounded, VisibilityRounded } from '@mui/icons-material';

const WalletDemoPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 5 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Демонстрация компонента кошелька
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Пример реализации компонента для привязки кошелька Telegram.
        </Typography>
        
        <Paper 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            mb: 5
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              px: 2
            }}
          >
            <Tab 
              icon={<VisibilityRounded />} 
              label="Превью" 
              iconPosition="start"
            />
            <Tab 
              icon={<CodeRounded />} 
              label="Код компонента" 
              iconPosition="start"
            />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {activeTab === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    p: 3,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2
                  }}
                >
                  <TelegramWalletConnect />
                </Box>
              </motion.div>
            )}
            
            {activeTab === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#1E1E1E',
                    borderRadius: 2,
                    overflow: 'auto',
                    maxHeight: '500px',
                    color: '#D4D4D4',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: 1.5
                  }}
                >
                  <pre>{`import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  alpha,
  useTheme,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Link as LinkIcon,
  Telegram,
  AccountBalanceWallet,
  Security,
  Speed
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ConnectCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  background: \`linear-gradient(135deg, \${alpha(theme.palette.primary.main, 0.04)} 0%, \${alpha(theme.palette.primary.light, 0.08)} 100%)\`,
  border: \`1px solid \${alpha(theme.palette.primary.main, 0.1)}\`,
  position: 'relative',
  overflow: 'hidden',
  maxWidth: 400,
  margin: '0 auto'
}));

// ... больше кода компонента ...

const TelegramWalletConnect = () => {
  const theme = useTheme();
  
  const handleConnectWallet = () => {
    // Логика привязки кошелька
  };

  return (
    <ConnectCard>
      {/* Содержимое компонента */}
      <ConnectButton
        fullWidth
        variant="contained"
        color="primary"
        startIcon={<LinkIcon />}
        onClick={handleConnectWallet}
      >
        Привязать кошелек Telegram
      </ConnectButton>
    </ConnectCard>
  );
};`}</pre>
                </Box>
              </motion.div>
            )}
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            sx={{ 
              borderRadius: 8,
              px: 5, 
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none'
            }}
            href="/wallet/telegram"
          >
            Перейти на страницу привязки
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default WalletDemoPage; 