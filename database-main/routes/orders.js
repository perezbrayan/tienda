const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Obtener todas las órdenes
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await req.db('orders')
      .select('*')
      .orderBy('created_at', 'desc');
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener órdenes' });
  }
});

// Obtener órdenes de un usuario específico
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    const orders = await req.db('orders')
      .where('user_id', req.params.userId)
      .select('*')
      .orderBy('created_at', 'desc');
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener órdenes del usuario' });
  }
});

// Obtener una orden específica
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await req.db('orders')
      .where('id', req.params.id)
      .first();
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Orden no encontrada' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error al obtener la orden:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la orden' });
  }
});

// Crear una nueva orden
router.post('/', verifyToken, async (req, res) => {
  try {
    const { user_id, items, total_amount, status = 'pending' } = req.body;

    const [orderId] = await req.db('orders').insert({
      user_id,
      items: JSON.stringify(items),
      total_amount,
      status,
      created_at: req.db.fn.now(),
      updated_at: req.db.fn.now()
    });

    res.json({
      success: true,
      message: 'Orden creada exitosamente',
      data: { id: orderId }
    });
  } catch (error) {
    console.error('Error al crear la orden:', error);
    res.status(500).json({ success: false, message: 'Error al crear la orden' });
  }
});

// Actualizar el estado de una orden
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    await req.db('orders')
      .where('id', req.params.id)
      .update({
        status,
        updated_at: req.db.fn.now()
      });

    res.json({
      success: true,
      message: 'Estado de la orden actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar el estado de la orden:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el estado de la orden' });
  }
});

// Eliminar una orden (solo administradores)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await req.db('orders')
      .where('id', req.params.id)
      .del();

    res.json({
      success: true,
      message: 'Orden eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar la orden:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la orden' });
  }
});

module.exports = router; 