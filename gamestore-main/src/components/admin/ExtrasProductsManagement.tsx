import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { API_URL } from '../../config/constants';
import { toast } from 'react-hot-toast';
import { MdEdit, MdDelete } from 'react-icons/md';

interface ExtrasProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: string;
}

export const ExtrasProductsManagement = () => {
  const [products, setProducts] = useState<ExtrasProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ExtrasProduct | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/db/api/extras/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      console.log('Productos cargados:', data); // Log para depuración
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setSelectedProduct(null);
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      image_url: ''
    });
    setSelectedFile(null);
  };

  const handleEdit = (product: ExtrasProduct) => {
    setSelectedProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }

    try {
      const url = selectedProduct
        ? `${API_URL}/db/api/extras/products/${selectedProduct.id}`
        : `${API_URL}/db/api/extras/products`;
      
      const method = selectedProduct ? 'PUT' : 'POST';
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Error al guardar el producto');
      
      fetchProducts();
      handleClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_URL}/db/api/extras/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData); // Log para depuración
        throw new Error('Error al eliminar el producto');
      }
      
      toast.success('Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el producto');
    }
  };

  const getImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '/placeholder-image.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    
    // Limpiar la URL de cualquier prefijo no deseado
    const cleanUrl = imageUrl
      .replace(/^\/db\//, '')  // Remover /db/ si existe
      .replace(/^\/+/, '')     // Remover slashes iniciales
      .replace(/\/+/g, '/');   // Reemplazar múltiples slashes por uno solo
    
    // Construir la URL completa asegurándose de que no haya doble slash
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const fullUrl = `${baseUrl}/${cleanUrl}`;
    
    console.log('URL original:', imageUrl);
    console.log('URL limpia:', cleanUrl);
    console.log('URL final construida:', fullUrl);
    
    return fullUrl;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#1a1a1a', fontWeight: 'bold' }}>
          Gestión de Productos Extras
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            bgcolor: '#00bcd4',
            '&:hover': {
              bgcolor: '#00acc1'
            }
          }}
        >
          Agregar Producto
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ 
        bgcolor: '#051923',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Imagen</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Título</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Descripción</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Precio</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Categoría</TableCell>
              <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={product.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.title}</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.description}</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>${product.price}</TableCell>
                <TableCell sx={{ color: '#a0aec0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>{product.category}</TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      onClick={() => handleEdit(product)}
                      sx={{
                        minWidth: 'auto',
                        p: 1,
                        color: '#00bcd4',
                        '&:hover': {
                          bgcolor: 'rgba(0, 188, 212, 0.1)'
                        }
                      }}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      sx={{
                        minWidth: 'auto',
                        p: 1,
                        color: '#f44336',
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.1)'
                        }
                      }}
                    >
                      <MdDelete />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <TextField
              fullWidth
              label="Precio"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Categoría"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Subir Imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Archivo seleccionado: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 