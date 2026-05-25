const express = require('express');
const router = express.Router();
const { getConfiguracion, updateConfiguracion } = require('../controllers/configuracionController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, soloAdmin, getConfiguracion);
router.put('/:clave', protect, soloAdmin, updateConfiguracion);

module.exports = router;
