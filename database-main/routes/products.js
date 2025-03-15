const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await req.db('products').select('*');
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await req.db('products').where('id', req.params.id).first();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el producto' });
  }
});

// Crear un nuevo producto (requiere autenticación)
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, type } = req.body;
    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

    const [productId] = await req.db('products').insert({
      title,
      description,
      price,
      type,
      image_url,
      created_at: req.db.fn.now(),
      updated_at: req.db.fn.now()
    });

    res.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { id: productId }
    });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ success: false, message: 'Error al crear el producto' });
  }
});

// Actualizar un producto (requiere autenticación)
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, type } = req.body;
    const updateData = {
      title,
      description,
      price,
      type,
      updated_at: req.db.fn.now()
    };

    if (req.file) {
      updateData.image_url = `/uploads/products/${req.file.filename}`;
    }

    await req.db('products')
      .where('id', req.params.id)
      .update(updateData);

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el producto' });
  }
});

// Eliminar un producto (requiere autenticación)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await req.db('products').where('id', req.params.id).del();
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el producto' });
  }
});

module.exports = router; 