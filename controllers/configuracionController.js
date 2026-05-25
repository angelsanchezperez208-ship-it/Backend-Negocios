const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');

// GET /api/configuracion
const getConfiguracion = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .order('clave');

  if (error) {
    res.status(500);
    throw new Error('Error al obtener configuración');
  }

  res.json(data);
});

// PUT /api/configuracion/:clave
const updateConfiguracion = asyncHandler(async (req, res) => {
  const { clave } = req.params;
  const { valor } = req.body;

  if (valor === undefined || valor === null || valor === '') {
    res.status(400);
    throw new Error('El campo valor es obligatorio');
  }

  const { data, error } = await supabase
    .from('configuracion')
    .update({ valor: String(valor), updated_at: new Date().toISOString() })
    .eq('clave', clave)
    .select()
    .single();

  if (error || !data) {
    res.status(404);
    throw new Error('Clave de configuración no encontrada');
  }

  res.json(data);
});

module.exports = { getConfiguracion, updateConfiguracion };
