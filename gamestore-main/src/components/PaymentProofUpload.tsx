import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface PaymentProofUploadProps {
  open: boolean;
  onClose: () => void;
  storeType: string;
  productId: string;
  productName: string;
  amount: number;
}

export const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  open,
  onClose,
  storeType,
  productId,
  productName,
  amount
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un comprobante');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('proof_image', selectedFile);
    formData.append('store_type', storeType);
    formData.append('product_id', productId);
    formData.append('product_name', productName);
    formData.append('amount', amount.toString());
    formData.append('user_id', localStorage.getItem('userId') || '');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/db/api/payment-proofs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Comprobante subido correctamente');
        onClose();
      } else {
        throw new Error(data.message || 'Error al subir el comprobante');
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast.error('Error al subir el comprobante');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Subir Comprobante de Pago</Typography>
          <Button onClick={handleClose} sx={{ minWidth: 'auto', p: 1 }}>
            <X size={20} />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Por favor sube una imagen de tu comprobante de pago. Asegúrate de que sea clara y legible.
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 3,
              border: '2px dashed',
              borderColor: 'primary.main',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            component="label"
          >
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <Box sx={{ py: 3 }}>
                <Upload size={40} style={{ marginBottom: '8px' }} />
                <Typography>
                  Arrastra una imagen o haz clic para seleccionar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PNG, JPG (max. 5MB)
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Detalles del pago:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Producto: {productName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monto: ${amount}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : <Upload size={20} />}
        >
          {uploading ? 'Subiendo...' : 'Subir Comprobante'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 