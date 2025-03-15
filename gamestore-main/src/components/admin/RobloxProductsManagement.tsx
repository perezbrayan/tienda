import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import { robloxService, RobloxProduct } from '../../services/robloxService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const RobloxProductsManagement = () => {
  const [products, setProducts] = useState<RobloxProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState<RobloxProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    amount: '',
    type: 'robux',
    image: null as File | null,
    imagePreview: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await robloxService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar los productos');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('amount', newProduct.amount);
      formData.append('type', newProduct.type);
      
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      if (editingProduct) {
        await robloxService.updateProduct(editingProduct.id, formData);
        setSuccess('Producto actualizado exitosamente');
      } else {
        await robloxService.createProduct(formData);
        setSuccess('Producto creado exitosamente');
      }

      setOpen(false);
      resetForm();
      loadProducts();
    } catch (err) {
      setError('Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await robloxService.deleteProduct(id);
        setSuccess('Producto eliminado exitosamente');
        loadProducts();
      } catch (err) {
        setError('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (product: RobloxProduct) => {
    setEditingProduct(product);
    setNewProduct({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      amount: product.amount.toString(),
      type: product.type || 'robux',
      image: null,
      imagePreview: product.image_url || ''
    });
    setOpen(true);
  };

  const resetForm = () => {
    setNewProduct({
      title: '',
      description: '',
      price: '',
      amount: '',
      type: 'robux',
      image: null,
      imagePreview: ''
    });
    setEditingProduct(null);
  };

  return (
    <Box sx={{ color: 'white' }}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" sx={{ backgroundColor: '#2D3748', color: 'white' }} onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" sx={{ backgroundColor: '#2D3748', color: 'white' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: 'rgba(26, 32, 44, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              Gestión de Productos de Roblox
            </Typography>
            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
              Administra los productos de Roblox y Bloxy Fruits
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            sx={{
              backgroundColor: '#3182ce',
              color: '#fff',
              px: 3,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#2c5282'
              }
            }}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'rgba(26, 32, 44, 0.7)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
                borderColor: '#3182ce'
              }
            }}>
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                paddingTop: '100%',
                backgroundColor: 'rgba(248, 249, 250, 0.1)',
                borderRadius: '16px 16px 0 0',
                overflow: 'hidden'
              }}>
                {product.image_url ? (
                  <CardMedia
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    image={product.image_url}
                    alt={product.title}
                  />
                ) : (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ImageIcon sx={{ fontSize: 60, color: 'rgba(255, 255, 255, 0.2)' }} />
                  </Box>
                )}
                <Chip
                  label={product.type?.toUpperCase() || 'ROBUX'}
                  sx={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    backgroundColor: 'rgba(49, 130, 206, 0.9)',
                    color: 'white',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)'
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {product.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#a0aec0', mb: 2 }}>
                  {product.description}
                </Typography>
                <Typography variant="h6" sx={{ color: '#3182ce', fontWeight: 'bold' }}>
                  USD ${product.price}
                </Typography>
                {product.amount && (
                  <Typography variant="body2" sx={{ color: '#a0aec0', mt: 1 }}>
                    Cantidad: {product.amount}
                  </Typography>
                )}
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <IconButton 
                  onClick={() => handleEdit(product)}
                  sx={{ color: '#3182ce' }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(product.id)}
                  sx={{ color: '#e53e3e' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={open} 
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(26, 32, 44, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                sx={{ input: { color: 'white' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                multiline
                rows={4}
                sx={{ textarea: { color: 'white' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                type="number"
                sx={{ input: { color: 'white' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad"
                value={newProduct.amount}
                onChange={(e) => setNewProduct({ ...newProduct, amount: e.target.value })}
                type="number"
                sx={{ input: { color: 'white' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={newProduct.type}
                  label="Tipo"
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                  sx={{ color: 'white' }}
                >
                  <MenuItem value="robux">Robux</MenuItem>
                  <MenuItem value="bloxyfruit">Bloxy Fruits</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ 
                p: 3, 
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Subir Imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {newProduct.imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <img 
                      src={newProduct.imagePreview} 
                      alt="Vista previa" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            resetForm();
          }} sx={{ color: 'white' }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 