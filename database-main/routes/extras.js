const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const extrasController = require('../controllers/extrasController');

const router = express.Router();

// Configurar multer para el almacenamiento de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/extras');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'extra-' + uniqueSuffix + path.extname(file.originalname));
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

// Rutas
router.get('/products', extrasController.getAll);
router.post('/products', verifyToken, upload.single('image'), extrasController.create);
router.put('/products/:id', verifyToken, upload.single('image'), extrasController.update);
router.delete('/products/:id', verifyToken, extrasController.delete);

module.exports = router; 