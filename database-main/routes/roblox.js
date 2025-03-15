const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Asegurarse de que el directorio existe
const uploadDir = path.join(__dirname, '../uploads/roblox');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'roblox-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no soportado'));
        }
    }
});

// Rutas para productos de Robux
router.post('/robux', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { amount, price } = req.body;
        const imageUrl = req.file ? `/uploads/roblox/${req.file.filename}` : null;
        console.log('Creando producto Robux con imagen:', imageUrl);

        const [id] = await db('roblox_products').insert({
            title: `${amount} Robux`,
            description: `Paquete de ${amount} Robux`,
            price: price,
            image_url: imageUrl,
            amount: amount,
            type: 'robux'
        });

        res.status(201).json({
            message: 'Producto de Robux creado exitosamente',
            id: id,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al crear producto de Robux:', error);
        res.status(500).json({
            error: 'Error al crear el producto de Robux',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Rutas para productos de Bloxy Fruits
router.post('/bloxyfruit', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, description, price } = req.body;
        const imageUrl = `/uploads/roblox/${req.file?.filename}`;

        const [id] = await db('roblox_products').insert({
            title,
            description,
            price,
            image_url: imageUrl,
            type: 'bloxyfruit'
        });

        res.status(201).json({
            message: 'Producto de Bloxy Fruits creado exitosamente',
            id: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al crear producto de Bloxy Fruits:', error);
        res.status(500).json({
            error: 'Error al crear el producto de Bloxy Fruits',
            timestamp: new Date().toISOString()
        });
    }
});

// Obtener todos los productos de Roblox
router.get('/products', async (req, res) => {
    try {
        console.log('Obteniendo productos de Roblox...');
        const products = await db('roblox_products')
            .select('*')
            .orderBy('created_at', 'desc');
        
        // Agregar la URL base a las imágenes
        const productsWithFullUrls = products.map(product => ({
            ...product,
            image_url: product.image_url ? `/db${product.image_url}` : null
        }));
        
        console.log('Productos encontrados:', productsWithFullUrls);
        res.json(productsWithFullUrls);
    } catch (error) {
        console.error('Error al obtener productos de Roblox:', error);
        res.status(500).json({
            error: 'Error al obtener los productos',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Obtener productos por tipo
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const products = await db('roblox_products')
            .where('type', type)
            .select('*')
            .orderBy('created_at', 'desc');

        res.json(products);
    } catch (error) {
        console.error(`Error al obtener productos de tipo ${req.params.type}:`, error);
        res.status(500).json({
            error: `Error al obtener los productos de tipo ${req.params.type}`,
            timestamp: new Date().toISOString()
        });
    }
});

// Crear nuevo producto
router.post('/products', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { title, description, price, amount, type } = req.body;
        const imageUrl = req.file ? `/uploads/roblox/${req.file.filename}` : null;

        const [id] = await db('roblox_products').insert({
            title,
            description,
            price,
            amount: amount || 1,
            type: type || 'robux',
            image_url: imageUrl
        });

        res.status(201).json({
            message: 'Producto creado exitosamente',
            id: id,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            error: 'Error al crear el producto',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Actualizar producto
router.put('/products/:id', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, amount, type } = req.body;
        const updateData = { title, description, price, amount: amount || 1, type: type || 'robux' };

        if (req.file) {
            updateData.image_url = `/uploads/roblox/${req.file.filename}`;
            
            // Eliminar la imagen anterior si existe
            const oldProduct = await db('roblox_products').where('id', id).first();
            if (oldProduct?.image_url) {
                const oldImagePath = path.join(__dirname, '..', oldProduct.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        await db('roblox_products')
            .where('id', id)
            .update(updateData);

        res.json({
            message: 'Producto actualizado exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            error: 'Error al actualizar el producto',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Eliminar producto
router.delete('/products/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtener la información del producto antes de eliminarlo
        const product = await db('roblox_products').where('id', id).first();
        
        if (product?.image_url) {
            // Eliminar la imagen si existe
            const imagePath = path.join(__dirname, '..', product.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db('roblox_products')
            .where('id', id)
            .delete();

        res.json({
            message: 'Producto eliminado exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            error: 'Error al eliminar el producto',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
