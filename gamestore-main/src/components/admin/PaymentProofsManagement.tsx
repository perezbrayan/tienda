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
  MenuItem,
  IconButton
} from '@mui/material';
import { MdVisibility, MdCheck, MdClose } from 'react-icons/md';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface PaymentProof {
  id: number;
  store_type: string;
  product_id: string;
  product_name: string;
  amount: number;
  game_account_id: string;
  proof_image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_notes?: string;
}

export const PaymentProofsManagement: React.FC = () => {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProofs = async () => {
    try {
      const response = await fetch(`${API_URL}/db/api/payment-proofs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener comprobantes');
      const data = await response.json();
      setProofs(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleViewProof = (proof: PaymentProof) => {
    setSelectedProof(proof);
    setAdminNotes(proof.admin_notes || '');
    setOpenDialog(true);
  };

  const handleUpdateStatus = async (id: number, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`${API_URL}/db/api/payment-proofs/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes
        })
      });

      if (!response.ok) throw new Error('Error al actualizar estado');
      
      setOpenDialog(false);
      fetchProofs();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#ffa726';
      case 'approved':
        return '#66bb6a';
      case 'rejected':
        return '#ef5350';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, color: '#1a1a1a', fontWeight: 'bold' }}>
        Gestión de Comprobantes de Pago
      </Typography>

      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Juego</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>ID de Cuenta</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proofs.map((proof) => (
              <TableRow key={proof.id}>
                <TableCell>{proof.id}</TableCell>
                <TableCell>{proof.store_type}</TableCell>
                <TableCell>{proof.product_name}</TableCell>
                <TableCell>{proof.game_account_id || 'N/A'}</TableCell>
                <TableCell>${proof.amount}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'inline-block',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: `${getStatusColor(proof.status)}20`,
                      color: getStatusColor(proof.status),
                      fontWeight: 'medium'
                    }}
                  >
                    {getStatusText(proof.status)}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(proof.created_at)}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleViewProof(proof)}
                    sx={{ color: '#00bcd4' }}
                  >
                    <MdVisibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProof && (
          <>
            <DialogTitle>
              Detalles del Comprobante #{selectedProof.id}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <img
                  src={`${API_URL}/db/uploads/payment_proofs/${selectedProof.proof_image_url}`}
                  alt="Comprobante de pago"
                  style={{ 
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Error loading image:', target.src);
                    target.onerror = null;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </Box>
              
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)', mb: 3 }}>
                <Typography><strong>Juego:</strong> {selectedProof.store_type}</Typography>
                <Typography><strong>Producto:</strong> {selectedProof.product_name}</Typography>
                <Typography><strong>ID de Cuenta:</strong> {selectedProof.game_account_id || 'N/A'}</Typography>
                <Typography><strong>Monto:</strong> ${selectedProof.amount}</Typography>
                <Typography><strong>Estado:</strong> {getStatusText(selectedProof.status)}</Typography>
                <Typography><strong>Fecha:</strong> {formatDate(selectedProof.created_at)}</Typography>
              </Box>

              <TextField
                fullWidth
                label="Notas del Administrador"
                multiline
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setOpenDialog(false)}
                color="inherit"
              >
                Cerrar
              </Button>
              {selectedProof.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleUpdateStatus(selectedProof.id, 'rejected')}
                    variant="contained"
                    color="error"
                    startIcon={<MdClose />}
                  >
                    Rechazar
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedProof.id, 'approved')}
                    variant="contained"
                    color="success"
                    startIcon={<MdCheck />}
                  >
                    Aprobar
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}; 