const db = require('../config/database');

const gameAccountsController = {
  // Registrar una nueva cuenta de juego
  async create(req, res) {
    try {
      const { user_id, game_type, game_account_id } = req.body;

      if (!user_id || !game_type || !game_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos'
        });
      }

      const [id] = await db('game_accounts').insert({
        user_id,
        game_type,
        game_account_id
      });

      res.status(201).json({
        success: true,
        data: {
          id,
          user_id,
          game_type,
          game_account_id
        }
      });
    } catch (error) {
      console.error('Error al crear cuenta de juego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear cuenta de juego'
      });
    }
  },

  // Obtener cuenta de juego por ID de usuario y tipo de juego
  async getByUserAndType(req, res) {
    try {
      const { user_id, game_type } = req.params;

      const account = await db('game_accounts')
        .where({ user_id, game_type })
        .first();

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Cuenta no encontrada'
        });
      }

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Error al obtener cuenta de juego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cuenta de juego'
      });
    }
  },

  // Actualizar cuenta de juego
  async update(req, res) {
    try {
      const { id } = req.params;
      const { game_account_id } = req.body;

      const updated = await db('game_accounts')
        .where({ id })
        .update({
          game_account_id,
          updated_at: db.fn.now()
        });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Cuenta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cuenta actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar cuenta de juego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar cuenta de juego'
      });
    }
  },

  // Eliminar cuenta de juego
  async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await db('game_accounts')
        .where({ id })
        .del();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Cuenta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cuenta eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar cuenta de juego:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar cuenta de juego'
      });
    }
  }
};

module.exports = gameAccountsController; 