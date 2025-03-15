const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const gameAccountsController = require('../controllers/gameAccountsController');

// Crear una nueva cuenta de juego
router.post('/', verifyToken, gameAccountsController.create);

// Obtener cuenta de juego por ID de usuario y tipo de juego
router.get('/:user_id/:game_type', verifyToken, gameAccountsController.getByUserAndType);

// Actualizar cuenta de juego
router.put('/:id', verifyToken, gameAccountsController.update);

// Eliminar cuenta de juego
router.delete('/:id', verifyToken, gameAccountsController.delete);

module.exports = router; 