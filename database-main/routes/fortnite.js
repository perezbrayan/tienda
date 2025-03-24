const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio existe
const uploadDir = path.join(__dirname, '../uploads/payment_proofs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para el almacenamiento de comprobantes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `payment-receipt-${uniqueSuffix}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes JPG, PNG, GIF y WebP.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Obtener todas las órdenes (solo admin)
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
    try {
        const db = req.db;
        const orders = await db('fortnite_orders')
            .select('*')
            .orderBy('created_at', 'desc');

        res.json({
            success: true,
            data: orders,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al obtener órdenes de Fortnite:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la lista de órdenes',
            timestamp: new Date().toISOString()
        });
    }
});

// Actualizar estado de una orden (solo admin)
router.put('/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, error_message } = req.body;
        const db = req.db;

        // Validar estado
        if (!['pending', 'completed', 'failed'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado inválido',
                timestamp: new Date().toISOString()
            });
        }

        // Actualizar estado de la orden
        await db('fortnite_orders')
            .where({ id })
            .update({
                status,
                error_message: error_message || null,
                updated_at: new Date()
            });

        res.json({
            success: true,
            message: 'Estado de la orden actualizado exitosamente',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al actualizar estado de la orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el estado de la orden',
            timestamp: new Date().toISOString()
        });
    }
});

// Crear una nueva orden (usuario autenticado o no)
router.post('/orders', upload.single('payment_receipt'), async (req, res) => {
    try {
        const { offer_id, item_name, price, is_bundle, metadata, username } = req.body;
        const db = req.db;

        // Validar campos requeridos
        if (!offer_id || !item_name || !price || !username) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos (offer_id, item_name, price, username)',
                timestamp: new Date().toISOString()
            });
        }

        // Validar que se haya subido un archivo
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'El comprobante de pago es requerido',
                timestamp: new Date().toISOString()
            });
        }

        console.log('Creando orden:', {
            username,
            offer_id,
            item_name,
            price,
            payment_receipt: req.file.filename
        });

        // Crear nueva orden
        const [orderId] = await db('fortnite_orders').insert({
            user_id: req.user?.id || null,
            username,
            offer_id,
            item_name,
            price,
            is_bundle: is_bundle || false,
            metadata: metadata ? JSON.stringify(metadata) : null,
            status: 'pending',
            payment_receipt: `/uploads/payment_proofs/${req.file.filename}`,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Verificar que la orden se creó correctamente
        const order = await db('fortnite_orders').where({ id: orderId }).first();
        
        console.log('Orden creada:', order);

        res.json({
            success: true,
            data: {
                id: orderId,
                message: 'Orden creada exitosamente',
                order: order
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al crear orden de Fortnite:', error);
        
        // Si hay un error, eliminar el archivo subido si existe
        if (req.file) {
            fs.unlink(req.file.path, (unlinkError) => {
                if (unlinkError) {
                    console.error('Error al eliminar archivo temporal:', unlinkError);
                }
            });
        }

        res.status(500).json({
            success: false,
            error: 'Error al crear la orden: ' + error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
