import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useFirebase } from '../../context/FirebaseContext';
import { Company } from '../../types';

const CompanyCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
}));

const CompanyAvatar = styled(Avatar)(({ theme }) => ({
  width: 45,
  height: 45,
  marginRight: theme.spacing(2),
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
}));

const CompanyName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem'
}));

const CompanyDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5)
}));

const RaffleCount = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginLeft: 'auto',
  fontWeight: 500
}));

const CompanySelector: React.FC = () => {
  const theme = useTheme();
  const { companies, activeCompany, setActiveCompany } = useFirebase();
  
  const handleCompanySelect = (company: Company) => {
    setActiveCompany(company);
  };
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ 
        mb: 2, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center'
      }}>
        Компании
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {companies.map((company) => (
          <Box key={company.id} sx={{ flexBasis: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' } }}>
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <CompanyCard 
                onClick={() => handleCompanySelect(company)}
                sx={{
                  border: activeCompany?.id === company.id 
                    ? `1px solid ${theme.palette.primary.main}` 
                    : undefined,
                  bgcolor: activeCompany?.id === company.id 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : undefined
                }}
              >
                <CompanyAvatar src={company.logo || '/placeholder-logo.png'} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <CompanyName>{company.name}</CompanyName>
                  <CompanyDescription noWrap>{company.description || 'Официальный партнер розыгрышей'}</CompanyDescription>
                </Box>
                <RaffleCount 
                  label="Розыгрыши"
                  color={activeCompany?.id === company.id ? "primary" : "default"}
                  variant={activeCompany?.id === company.id ? "filled" : "outlined"}
                />
              </CompanyCard>
            </motion.div>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CompanySelector; 