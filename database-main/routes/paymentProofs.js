const express = require('express');
const router = express.Router();
const paymentProofsController = require('../controllers/paymentProofsController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio existe
const uploadDir = path.join(__dirname, '../uploads/payment_proofs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
  }
});

// Crear un nuevo comprobante de pago
router.post('/', upload.single('proof_image'), paymentProofsController.create);

// Obtener todos los comprobantes (admin)
router.get('/', verifyToken, isAdmin, paymentProofsController.getAll);

// Obtener comprobantes por usuario
router.get('/user/:user_id', verifyToken, paymentProofsController.getByUser);

// Actualizar estado del comprobante (admin)
router.put('/:id/status', verifyToken, isAdmin, paymentProofsController.updateStatus);

module.exports = router; 