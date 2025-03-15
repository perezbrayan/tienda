const { db } = require('../config/database');

const paymentProofsController = {
  // Crear un nuevo comprobante de pago
  async create(req, res) {
    try {
      const { store_type, product_id, product_name, amount, game_account_id } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'La imagen del comprobante es requerida'
        });
      }

      // Guardar solo el nombre del archivo
      const proof_image_url = req.file.filename;

      if (!store_type || !product_id || !product_name || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos'
        });
      }

      // Formato de fecha compatible con MySQL
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const [id] = await db('payment_proofs').insert({
        store_type,
        product_id,
        product_name,
        amount,
        game_account_id,
        proof_image_url,
        status: 'pending',
        created_at: now,
        updated_at: now
      });

      res.status(201).json({
        success: true,
        data: {
          id,
          store_type,
          product_id,
          product_name,
          amount,
          game_account_id,
          proof_image_url,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('Error al crear comprobante de pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear comprobante de pago'
      });
    }
  },

  // Obtener todos los comprobantes de pago (para admin)
  async getAll(req, res) {
    try {
      const proofs = await db('payment_proofs')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: proofs
      });
    } catch (error) {
      console.error('Error al obtener comprobantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener comprobantes'
      });
    }
  },

  // Obtener comprobantes por usuario
  async getByUser(req, res) {
    try {
      const { user_id } = req.params;
      const proofs = await db('payment_proofs')
        .where({ user_id })
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: proofs
      });
    } catch (error) {
      console.error('Error al obtener comprobantes del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener comprobantes del usuario'
      });
    }
  },

  // Actualizar estado del comprobante (para admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      const updated = await db('payment_proofs')
        .where({ id })
        .update({
          status,
          admin_notes,
          updated_at: db.fn.now()
        });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Comprobante no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Estado actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar estado'
      });
    }
  }
};

module.exports = paymentProofsController; 