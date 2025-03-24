import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import axios from 'axios';
import { apiConfig } from '../../config/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const BOT_URL = apiConfig.botURL;

interface FortniteOrder {
  id: number;
  user_id: number;
  username: string;
  offer_id: string;
  item_name: string;
  price: number;
  is_bundle: boolean;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  metadata?: string;
  payment_receipt?: string;
  created_at: string;
  updated_at: string;
}

export const FortniteOrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<FortniteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FortniteOrder | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [responseDialog, setResponseDialog] = useState<{open: boolean, message: string}>({
    open: false,
    message: ''
  });
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/db/api/fortnite/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (status: 'completed' | 'failed', order: FortniteOrder) => {
    if (!order) return;

    try {
      setProcessingOrder(order.id);
      const token = localStorage.getItem('token');

      if (status === 'completed') {
        try {
          // Mostrar mensaje de procesamiento
          setResponseDialog({
            open: true,
            message: 'Enviando regalo... Por favor espere.'
          });

          const vpsResponse = await axios.post(`${BOT_URL}/bot2/api/send-gift`, {
            username: order.username,
            offerId: order.offer_id,
            price: order.price,
            isBundle: order.is_bundle,
            botId: 1 // Usar el primer bot
          });

          // Mostrar la respuesta exitosa
          setResponseDialog({
            open: true,
            message: `Regalo enviado exitosamente:\n${JSON.stringify(vpsResponse.data, null, 2)}`
          });

          // Actualizar el estado en la base de datos
          await axios.put(
            `${API_URL}/db/api/fortnite/orders/${order.id}/status`,
            {
              status: 'completed'
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          // Actualizar la lista de órdenes
          fetchOrders();
        } catch (vpsError: any) {
          // Mostrar error detallado
          setResponseDialog({
            open: true,
            message: `Error al enviar el regalo:\n${JSON.stringify({
              error: vpsError.message,
              details: vpsError.response?.data || 'No hay detalles adicionales'
            }, null, 2)}`
          });
          return;
        }
      } else {
        // Si es fallo, actualizamos directamente el estado
        await axios.put(
          `${API_URL}/db/api/fortnite/orders/${order.id}/status`,
          {
            status,
            error_message: errorMessage
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        fetchOrders();
      }

      setOpenDialog(false);
      setErrorMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar el estado');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleViewReceipt = async (receipt: string | undefined) => {
    if (receipt) {
      try {
        console.log('Intentando cargar comprobante:', receipt);
        
        // Construir la URL directamente usando la ruta de archivos estáticos
        const imageUrl = `${API_URL}${receipt}`;
        console.log('URL del comprobante:', imageUrl);
        
        setSelectedReceipt(imageUrl);
        setShowReceiptDialog(true);
      } catch (error: any) {
        console.error('Error al cargar el comprobante:', error);
        setResponseDialog({
          open: true,
          message: `Error al cargar el comprobante de pago: ${error.message}`
        });
      }
    } else {
      setResponseDialog({
        open: true,
        message: 'No se ha subido el comprobante de pago para esta orden.'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#051923', p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
        Gestión de Órdenes de Fortnite
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#ff8a80' }}>
          {error}
        </Alert>
      )}

      <TableContainer 
        component={Paper} 
        sx={{ 
          bgcolor: '#051923', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Usuario Web</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Usuario Fortnite</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Item</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Precio</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Fecha</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' } }}>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{order.id}</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {order.user_id ? `ID: ${order.user_id}` : 'No registrado'}
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Chip 
                    label={order.username} 
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ bgcolor: 'rgba(25, 118, 210, 0.1)' }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{order.item_name}</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{order.price} V-Bucks</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Chip 
                    label={order.is_bundle ? 'Bundle' : 'Item'} 
                    size="small" 
                    color={order.is_bundle ? 'primary' : 'default'}
                    sx={{ 
                      bgcolor: order.is_bundle ? 'rgba(25, 118, 210, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      color: order.is_bundle ? '#90caf9' : '#a0aec0'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Chip 
                    label={order.status} 
                    color={getStatusColor(order.status) as any}
                    size="small"
                    sx={{ 
                      bgcolor: order.status === 'completed' ? 'rgba(46, 125, 50, 0.1)' :
                             order.status === 'failed' ? 'rgba(211, 47, 47, 0.1)' :
                             'rgba(245, 124, 0, 0.1)',
                      color: order.status === 'completed' ? '#81c784' :
                            order.status === 'failed' ? '#ff8a80' :
                            '#ffb74d'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  {new Date(order.created_at).toLocaleString()}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={() => handleViewReceipt(order.payment_receipt)}
                    sx={{ 
                      mr: 1,
                      bgcolor: 'rgba(2, 136, 209, 0.1)',
                      color: '#4fc3f7',
                      '&:hover': {
                        bgcolor: 'rgba(2, 136, 209, 0.2)'
                      }
                    }}
                  >
                    Ver Comprobante
                  </Button>
                  {order.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleStatusUpdate('completed', order)}
                        disabled={processingOrder === order.id}
                        sx={{ 
                          mr: 1,
                          bgcolor: 'rgba(46, 125, 50, 0.1)',
                          color: '#81c784',
                          '&:hover': {
                            bgcolor: 'rgba(46, 125, 50, 0.2)'
                          }
                        }}
                      >
                        {processingOrder === order.id ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1, color: '#81c784' }} />
                            Procesando...
                          </>
                        ) : (
                          'Completar'
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOpenDialog(true);
                        }}
                        disabled={processingOrder === order.id}
                        sx={{ 
                          bgcolor: 'rgba(211, 47, 47, 0.1)',
                          color: '#ff8a80',
                          '&:hover': {
                            bgcolor: 'rgba(211, 47, 47, 0.2)'
                          }
                        }}
                      >
                        Falló
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          style: {
            backgroundColor: '#051923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Marcar orden como fallida</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mensaje de error"
            fullWidth
            variant="outlined"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff8a80',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#a0aec0',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#a0aec0' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => handleStatusUpdate('failed', selectedOrder as FortniteOrder)} 
            color="error"
            sx={{ 
              color: '#ff8a80',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.1)'
              }
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={responseDialog.open} 
        onClose={() => {
          if (!processingOrder) {
            setResponseDialog({open: false, message: ''});
          }
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#051923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          {processingOrder ? 'Procesando Orden' : 'Respuesta del Servidor'}
        </DialogTitle>
        <DialogContent>
          <Box 
            component="pre" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              wordWrap: 'break-word',
              bgcolor: 'rgba(0, 0, 0, 0.2)',
              color: '#a0aec0',
              p: 2,
              borderRadius: 1
            }}
          >
            {responseDialog.message}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResponseDialog({open: false, message: ''})}
            disabled={processingOrder !== null}
            sx={{ color: '#a0aec0' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showReceiptDialog}
        onClose={() => setShowReceiptDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#051923',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Comprobante de Pago</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <img
              src={selectedReceipt}
              alt="Comprobante de pago"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowReceiptDialog(false)} 
            sx={{ color: '#a0aec0' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
