import React, { useEffect, useState } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle initial visibility
  useEffect(() => {
    if (value === index) {
      setIsVisible(true);
    }
  }, [value, index]);
  
  const variants = {
    hidden: { 
      opacity: 0,
      y: 10,
      display: 'none',
    },
    visible: { 
      opacity: 1,
      y: 0,
      display: 'block',
      transition: {
        duration: 0.4,
        ease: [0.2, 0.8, 0.2, 1],
      }
    }
  };

  // Always render the content but control visibility with CSS
  return (
    <div
      role="tabpanel"
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      <motion.div
        initial={false}
        animate={value === index ? "visible" : "hidden"}
        variants={variants}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ModernTabPanel; 