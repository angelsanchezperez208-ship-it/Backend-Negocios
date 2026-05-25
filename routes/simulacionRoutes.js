const express = require('express');
const router = express.Router();
const {
  crearSimulacion,
  getSimulaciones,
  getSimulacion,
} = require('../controllers/simulacionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, crearSimulacion);
router.get('/', protect, getSimulaciones);
router.get('/:id', protect, getSimulacion);

module.exports = router;
