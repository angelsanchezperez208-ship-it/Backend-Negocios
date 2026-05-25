const express = require('express');
const router = express.Router();
const {
  getResumen,
  getReporteUsuario,
  getReporteEscenario,
} = require('../controllers/reporteController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

router.get('/resumen', protect, soloAdmin, getResumen);
router.get('/usuario/:id', protect, soloAdmin, getReporteUsuario);
router.get('/escenario/:id', protect, soloAdmin, getReporteEscenario);

module.exports = router;
