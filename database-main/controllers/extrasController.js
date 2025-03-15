const { db } = require('../config/database');

const extrasController = {
  // Obtener todos los productos extras
  async getAll(req, res) {
    try {
      const products = await db('extras_products')
        .where('status', 'active')
        .orderBy('created_at', 'desc');

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error al obtener productos extras:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos extras'
      });
    }
  },

  // Crear nuevo producto extra
  async create(req, res) {
    try {
      const { title, description, price, category } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'La imagen del producto es requerida'
        });
      }

      const image_url = `/uploads/extras/${req.file.filename}`;

      const [id] = await db('extras_products').insert({
        title,
        description,
        price,
        category,
        image_url,
        status: 'active',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });

      res.status(201).json({
        success: true,
        data: {
          id,
          title,
          description,
          price,
          category,
          image_url
        }
      });
    } catch (error) {
      console.error('Error al crear producto extra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear producto extra'
      });
    }
  },

  // Actualizar producto extra
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, price, category, status } = req.body;
      const updateData = { 
        title, 
        description, 
        price, 
        category,
        status,
        updated_at: db.fn.now()
      };

      if (req.file) {
        updateData.image_url = `/uploads/extras/${req.file.filename}`;
      }

      await db('extras_products')
        .where('id', id)
        .update(updateData);

      res.json({
        success: true,
        message: 'Producto actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar producto extra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar producto extra'
      });
    }
  },

  // Eliminar producto extra (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      await db('extras_products')
        .where('id', id)
        .update({
          status: 'deleted',
          updated_at: db.fn.now()
        });

      res.json({
        success: true,
        message: 'Producto eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar producto extra:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar producto extra'
      });
    }
  }
};

module.exports = extrasController; 