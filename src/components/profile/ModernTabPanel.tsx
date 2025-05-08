import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanelContainer = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  width: '100%',
}));

const ModernTabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  const theme = useTheme();
  
  const variants = {
    hidden: { 
      opacity: 0,
      y: 10,
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.2, 0.8, 0.2, 1],
      }
    }
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      <AnimatePresence mode="wait">
        {value === index && (
          <TabPanelContainer
            key={`panel-${index}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
          >
            {children}
          </TabPanelContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernTabPanel; 