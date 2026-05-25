const express = require('express');
const router = express.Router();
const {
  registro,
  login,
  getPerfil,
  updatePerfil,
  getUsuarios,
  cambiarRol,
  eliminarUsuario,
} = require('../controllers/usuarioController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/registro', registro);
router.post('/login', loginLimiter, login);
router.get('/perfil', protect, getPerfil);
router.put('/perfil', protect, updatePerfil);
router.get('/', protect, soloAdmin, getUsuarios);
router.patch('/:id/rol', protect, soloAdmin, cambiarRol);
router.delete('/:id', protect, soloAdmin, eliminarUsuario);

module.exports = router;
