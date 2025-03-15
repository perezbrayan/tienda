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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import { gameProductsService, GameProduct } from '../../services/gameProductsService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

export const GameProductsManagement = () => {
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<string>('leagueoflegends');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProduct, setEditingProduct] = useState<GameProduct | null>(null);
  const [newProduct, setNewProduct] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    game_type: 'leagueoflegends',
    image: null as File | null,
    profile_image: null as File | null,
    imagePreview: '',
    profileImagePreview: ''
  });

  useEffect(() => {
    loadProducts();
    setNewProduct(prev => ({
      ...prev,
      game_type: selectedGameType
    }));
  }, [selectedGameType]);

  const loadProducts = async () => {
    try {
      const data = await gameProductsService.getProducts(selectedGameType);
      setProducts(data);
    } catch (err) {
      setError('Error al cargar los productos');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'profile') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'main') {
          setNewProduct(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result as string
          }));
        } else {
          setNewProduct(prev => ({
            ...prev,
            profile_image: file,
            profileImagePreview: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('id', newProduct.id);
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('game_type', newProduct.game_type);
      
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }
      if (newProduct.profile_image) {
        formData.append('profile_image', newProduct.profile_image);
      }

      if (editingProduct) {
        await gameProductsService.updateProduct(editingProduct.id, formData);
        setSuccess('Producto actualizado exitosamente');
      } else {
        await gameProductsService.createProduct(formData);
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
        await gameProductsService.deleteProduct(id);
        setSuccess('Producto eliminado exitosamente');
        loadProducts();
      } catch (err) {
        setError('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (product: GameProduct) => {
    setEditingProduct(product);
    setNewProduct({
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      game_type: product.game_type,
      image: null,
      profile_image: null,
      imagePreview: product.image_url ? `${API_URL}/db${product.image_url}` : '',
      profileImagePreview: product.profile_image_url ? `${API_URL}/db${product.profile_image_url}` : ''
    });
    setOpen(true);
  };

  const resetForm = () => {
    setNewProduct({
      id: '',
      title: '',
      description: '',
      price: '',
      game_type: 'leagueoflegends',
      image: null,
      profile_image: null,
      imagePreview: '',
      profileImagePreview: ''
    });
    setEditingProduct(null);
  };

  return (
    <Box sx={{ color: 'white' }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert 
          onClose={() => setError('')}
          severity="error" 
          sx={{ 
            backgroundColor: '#2D3748', 
            color: 'white',
            width: '100%'
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
      >
        <Alert 
          onClose={() => setSuccess('')}
          severity="success" 
          sx={{ 
            backgroundColor: '#2D3748', 
            color: 'white',
            width: '100%'
          }}
        >
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
              Gestión de Productos de Juegos
            </Typography>
            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
              Administra los productos para diferentes plataformas de juegos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: 'white' }}>Tipo de Juego</InputLabel>
              <Select
                value={selectedGameType}
                label="Tipo de Juego"
                onChange={(e) => setSelectedGameType(e.target.value)}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3182ce',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3182ce',
                  },
                  backgroundColor: 'rgba(26, 32, 44, 0.4)',
                }}
              >
                <MenuItem value="supercell">Supercell</MenuItem>
                <MenuItem value="streaming">Streaming</MenuItem>
                <MenuItem value="leagueoflegends">League of Legends</MenuItem>
              </Select>
            </FormControl>
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
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    image={`${API_URL}/db${product.image_url}`}
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
                {product.profile_image_url && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '3px solid rgba(255, 255, 255, 0.9)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <img
                      src={`${API_URL}/db${product.profile_image_url}`}
                      alt="Perfil"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}
                <Chip
                  label={product.game_type.toUpperCase()}
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
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    lineHeight: 1.2,
                    mb: 2
                  }}
                >
                  {product.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#a0aec0',
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '4.5em'
                  }}
                >
                  {product.description}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#3182ce',
                    fontWeight: 'bold',
                    fontSize: '1.4rem'
                  }}
                >
                  USD ${product.price}
                </Typography>
              </CardContent>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <IconButton 
                  onClick={() => handleEdit(product)}
                  sx={{ 
                    color: '#3182ce',
                    '&:hover': {
                      backgroundColor: 'rgba(49, 130, 206, 0.1)'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(product.id)}
                  sx={{ 
                    color: '#e53e3e',
                    '&:hover': {
                      backgroundColor: 'rgba(229, 62, 62, 0.1)'
                    }
                  }}
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
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          px: 3,
          py: 2
        }}>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID de la cuenta"
                value={newProduct.id}
                onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3182ce',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3182ce',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3182ce',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3182ce',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3182ce',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3182ce',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                type="number"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#3182ce',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#3182ce',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tipo de Juego</InputLabel>
                <Select
                  value={newProduct.game_type}
                  label="Tipo de Juego"
                  onChange={(e) => setNewProduct({ ...newProduct, game_type: e.target.value })}
                  sx={{
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3182ce',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#3182ce',
                    },
                  }}
                >
                  <MenuItem value="supercell">Supercell</MenuItem>
                  <MenuItem value="streaming">Streaming</MenuItem>
                  <MenuItem value="leagueoflegends">League of Legends</MenuItem>
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
                  sx={{
                    mb: 2,
                    color: 'white',
                    borderColor: '#3182ce',
                    '&:hover': {
                      borderColor: '#4299e1',
                      backgroundColor: 'rgba(49, 130, 206, 0.1)'
                    }
                  }}
                >
                  Subir Imagen Principal
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'main')}
                  />
                </Button>
                {newProduct.imagePreview && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img 
                      src={newProduct.imagePreview} 
                      alt="Vista previa" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        objectFit: 'contain' 
                      }} 
                    />
                  </Box>
                )}
              </Box>
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
                  sx={{
                    mb: 2,
                    color: 'white',
                    borderColor: '#3182ce',
                    '&:hover': {
                      borderColor: '#4299e1',
                      backgroundColor: 'rgba(49, 130, 206, 0.1)'
                    }
                  }}
                >
                  Subir Imagen de Perfil
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'profile')}
                  />
                </Button>
                {newProduct.profileImagePreview && (
                  <Box sx={{ mt: 2, position: 'relative' }}>
                    <img 
                      src={newProduct.profileImagePreview} 
                      alt="Vista previa de perfil" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        objectFit: 'contain' 
                      }} 
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            sx={{ 
              color: '#a0aec0',
              '&:hover': {
                backgroundColor: 'rgba(160, 174, 192, 0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#3182ce',
              color: '#fff',
              px: 4,
              '&:hover': {
                backgroundColor: '#2c5282'
              }
            }}
          >
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 