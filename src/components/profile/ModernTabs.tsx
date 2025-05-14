import React from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  useTheme, 
  alpha, 
  useMediaQuery 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface StyledTabProps {
  label: string;
  icon: React.ReactNode;
  value: number;
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  marginBottom: theme.spacing(2),
  overflow: 'visible'
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  background: alpha(theme.palette.background.paper, 0.8),
  position: 'relative',
  padding: theme.spacing(0.7),
  boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.07)}`,
  backdropFilter: 'blur(10px)',
  display: 'flex',
  overflow: 'visible',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
}));

const TabIndicator = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
  zIndex: 0,
  transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  zIndex: 1,
  color: theme.palette.text.secondary,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  padding: theme.spacing(1.8, 3),
  minHeight: 'auto',
  borderRadius: theme.spacing(2.5),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: theme.palette.common.white,
  },
  '& .MuiTab-iconWrapper': {
    marginRight: theme.spacing(1),
    marginBottom: '0 !important',
    transition: 'transform 0.2s ease',
  },
  '&:hover': {
    color: theme.palette.text.primary,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    '& .MuiTab-iconWrapper': {
      transform: 'scale(1.1)',
    },
  },
  '&.Mui-selected:hover': {
    color: theme.palette.common.white,
    backgroundColor: 'transparent',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    padding: theme.spacing(1.2, 2),
    '& .MuiTab-iconWrapper': {
      marginRight: theme.spacing(0.7),
    },
  },
}));

// Helper function to get a tab's position and dimensions
const getTabDimensions = (tabsRef: React.RefObject<HTMLDivElement | null>, index: number): { left: number, width: number, height: number } => {
  if (!tabsRef.current) return { left: 0, width: 0, height: 0 };
  
  const tabNodes = tabsRef.current.querySelectorAll('[role="tab"]');
  if (tabNodes && tabNodes[index]) {
    const tabElement = tabNodes[index] as HTMLElement;
    return {
      left: tabElement.offsetLeft,
      width: tabElement.offsetWidth,
      height: tabElement.offsetHeight
    };
  }
  
  return { left: 0, width: 0, height: 0 };
};

interface ModernTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  tabs: {
    label: string;
    icon: React.ReactElement;
  }[];
}

const ModernTabs: React.FC<ModernTabsProps> = ({ value, onChange, tabs }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const tabsRef = React.useRef<HTMLDivElement>(null);
  
  const { left, width, height } = React.useMemo(
    () => getTabDimensions(tabsRef, value),
    [tabsRef, value]
  );

  return (
    <TabsContainer ref={tabsRef}>
      <TabIndicator
        initial={false}
        animate={{
          left,
          width,
          height
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }}
        style={{ top: 0 }}
      />
      
      <StyledTabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <StyledTab
            key={index}
            icon={tab.icon}
            label={tab.label}
            value={index}
            disableRipple
          />
        ))}
      </StyledTabs>
    </TabsContainer>
  );
};

export default ModernTabs; 