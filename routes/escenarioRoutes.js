const express = require('express');
const router = express.Router();
const {
  getEscenarios,
  getEscenario,
  crearEscenario,
  actualizarEscenario,
} = require('../controllers/escenarioController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, getEscenarios);
router.get('/:id', protect, getEscenario);
router.post('/', protect, soloAdmin, crearEscenario);
router.put('/:id', protect, soloAdmin, actualizarEscenario);

module.exports = router;
