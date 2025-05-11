import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Divider,
  useTheme,
  CardMedia,
  Chip,
  alpha,
  Stack
} from '@mui/material';
import { Add, Edit, Delete, Language, Phone, Email, LocationOn } from '@mui/icons-material';
import { useFirebase } from '../../context/FirebaseContext';
import { Company } from '../../types';
import CompanyForm from './CompanyForm';

const CompaniesManager: React.FC = () => {
  const theme = useTheme();
  const { companies, removeCompany } = useFirebase();
  const [openForm, setOpenForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | undefined>(undefined);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, company: Company | null }>({
    open: false,
    company: null
  });
  
  const handleAddNew = () => {
    setEditingCompany(undefined);
    setOpenForm(true);
  };
  
  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setOpenForm(true);
  };
  
  const handleDelete = (company: Company) => {
    setDeleteDialog({
      open: true,
      company
    });
  };
  
  const confirmDelete = async () => {
    if (deleteDialog.company) {
      try {
        await removeCompany(deleteDialog.company.id);
        setDeleteDialog({ open: false, company: null });
      } catch (error) {
        console.error('Ошибка при удалении компании:', error);
      }
    }
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, company: null });
  };
  
  const closeForm = () => {
    setOpenForm(false);
  };
  
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Управление компаниями
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={handleAddNew}
          >
            Добавить компанию
          </Button>
        </Box>
        
        <Stack spacing={3}>
          {companies.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Нет компаний. Добавьте первую компанию, нажав на кнопку "Добавить компанию".
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {companies.map(company => (
                <Box key={company.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' } }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {company.isMain && (
                      <Chip 
                        label="Основная" 
                        color="primary" 
                        size="small"
                        sx={{ 
                          position: 'absolute', 
                          top: -10, 
                          right: 16,
                          zIndex: 1
                        }}
                      />
                    )}
                    
                    <Box sx={{ 
                      height: 100, 
                      backgroundColor: company.color || theme.palette.primary.main,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}>
                      <Avatar
                        src={company.logo}
                        alt={company.name}
                        variant="rounded"
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          position: 'absolute',
                          bottom: -30,
                          backgroundColor: 'white',
                          padding: 1,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                    
                    <CardContent sx={{ pt: 5, flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom align="center">
                        {company.name}
                      </Typography>
                      
                      {company.description && (
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {company.description}
                        </Typography>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {company.website && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Language fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" noWrap>
                            {company.website}
                          </Typography>
                        </Box>
                      )}
                      
                      {company.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {company.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {company.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Email fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" noWrap>
                            {company.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {company.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2" noWrap>
                            {company.address}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(company)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(company)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Stack>
      </Box>
      
      {/* Company Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={closeForm}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <CompanyForm 
            company={editingCompany}
            onCancel={closeForm}
            onSaved={closeForm}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить компанию "{deleteDialog.company?.name}"? 
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Отмена</Button>
          <Button onClick={confirmDelete} color="error">Удалить</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompaniesManager; 