import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface GameAccount {
  id: number;
  user_id: string;
  game_type: string;
  game_account_id: string;
  created_at: string;
}

const LeagueAccounts = () => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingAccount, setEditingAccount] = useState<GameAccount | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        toast.error('Debes iniciar sesión para ver tus cuentas');
        return;
      }

      const response = await fetch(`${API_URL}/db/api/game-accounts/user/${userId}?game_type=lol`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener las cuentas');

      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Error al cargar las cuentas');
    }
  };

  const handleAddAccount = async () => {
    if (!nickname.trim()) {
      toast.error('Por favor ingresa un nickname');
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        toast.error('Debes iniciar sesión para agregar cuentas');
        return;
      }

      const response = await fetch(`${API_URL}/db/api/game-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          game_type: 'lol',
          game_account_id: nickname
        })
      });

      if (!response.ok) throw new Error('Error al agregar la cuenta');

      const data = await response.json();
      if (data.success) {
        toast.success('Cuenta agregada correctamente');
        setNickname('');
        setOpenDialog(false);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Error al agregar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAccount = async () => {
    if (!editingAccount || !nickname.trim()) {
      toast.error('Por favor ingresa un nickname');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Debes iniciar sesión para editar cuentas');
        return;
      }

      const response = await fetch(`${API_URL}/db/api/game-accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          game_account_id: nickname
        })
      });

      if (!response.ok) throw new Error('Error al editar la cuenta');

      const data = await response.json();
      if (data.success) {
        toast.success('Cuenta actualizada correctamente');
        setNickname('');
        setOpenDialog(false);
        setEditingAccount(null);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error editing account:', error);
      toast.error('Error al editar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Debes iniciar sesión para eliminar cuentas');
        return;
      }

      const response = await fetch(`${API_URL}/db/api/game-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar la cuenta');

      const data = await response.json();
      if (data.success) {
        toast.success('Cuenta eliminada correctamente');
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar la cuenta');
    }
  };

  const handleOpenDialog = (account?: GameAccount) => {
    if (account) {
      setEditingAccount(account);
      setNickname(account.game_account_id);
    } else {
      setEditingAccount(null);
      setNickname('');
    }
    setOpenDialog(true);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#051923',
      pt: 12,
      pb: 8
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("https://i.postimg.cc/5NrmPNH6/content-original-championillustrations-group-slashes-9828cf13cecf88fb9f21ee17afa6874e.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 'lg', mx: 'auto', px: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
          Mis Cuentas de League of Legends
        </Typography>

        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={() => handleOpenDialog()}
            startIcon={<Plus />}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            Agregar Cuenta
          </Button>
        </Box>

        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card sx={{
                bgcolor: 'rgba(26, 32, 44, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {account.game_account_id}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(account)}
                        sx={{ color: 'primary.main', mr: 1 }}
                      >
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAccount(account.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'gray.400' }}>
                    Agregada el {new Date(account.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            setEditingAccount(null);
            setNickname('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingAccount ? 'Editar Cuenta' : 'Agregar Nueva Cuenta'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nickname"
              fullWidth
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenDialog(false);
                setEditingAccount(null);
                setNickname('');
              }}
              color="inherit"
            >
              Cancelar
            </Button>
            <Button
              onClick={editingAccount ? handleEditAccount : handleAddAccount}
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Guardando...' : editingAccount ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default LeagueAccounts; 