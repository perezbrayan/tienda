const express = require('express');
const multer = require('multer');
const path = require('path');
const { db } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Configurar multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/games'));
    },
    filename: function (req, file, cb) {
        // Agregar un prefijo basado en el tipo de imagen
        const prefix = file.fieldname === 'profile_image' ? 'profile_' : 'main_';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Configurar el middleware para manejar múltiples campos de archivo
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
]);

// Obtener todos los productos de un juego específico
router.get('/products/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const products = await db('game_products')
            .where('game_type', gameType)
            .select('*');

        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            error: 'Error al obtener productos',
            timestamp: new Date().toISOString()
        });
    }
});

// Crear nuevo producto
router.post('/products', verifyToken, uploadFields, async (req, res) => {
    try {
        const { title, description, price, game_type } = req.body;
        
        // Obtener las URLs de las imágenes si se proporcionaron
        const imageUrl = req.files['image'] ? 
            `/uploads/games/${req.files['image'][0].filename}` : null;
        const profileImageUrl = req.files['profile_image'] ? 
            `/uploads/games/${req.files['profile_image'][0].filename}` : null;

        // Validar el tipo de juego
        const validGameTypes = ['supercell', 'streaming', 'lol'];
        if (!validGameTypes.includes(game_type)) {
            return res.status(400).json({
                error: 'Tipo de juego no válido',
                timestamp: new Date().toISOString()
            });
        }

        const [id] = await db('game_products').insert({
            title,
            description,
            price,
            game_type,
            image_url: imageUrl,
            profile_image_url: profileImageUrl
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
            timestamp: new Date().toISOString()
        });
    }
});

// Actualizar producto
router.put('/products/:id', verifyToken, uploadFields, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, game_type } = req.body;
        const updateData = { title, description, price, game_type };

        // Actualizar las URLs de las imágenes si se proporcionaron nuevas
        if (req.files['image']) {
            updateData.image_url = `/uploads/games/${req.files['image'][0].filename}`;
        }
        if (req.files['profile_image']) {
            updateData.profile_image_url = `/uploads/games/${req.files['profile_image'][0].filename}`;
        }

        await db('game_products')
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
            timestamp: new Date().toISOString()
        });
    }
});

// Eliminar producto
router.delete('/products/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db('game_products')
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
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router; 