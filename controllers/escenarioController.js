const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');

// GET /api/escenarios
const getEscenarios = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('escenarios')
    .select('*')
    .eq('activo', true)
    .order('id');

  if (error) {
    console.error('Error al obtener escenarios:', error);
    res.status(500);
    throw new Error('Error al obtener escenarios');
  }

  res.json(data);
});

// GET /api/escenarios/:id
const getEscenario = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('escenarios')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) {
    console.error('Error al obtener escenario:', error);
    res.status(404);
    throw new Error('Escenario no encontrado');
  }

  res.json(data);
});

// POST /api/escenarios  (admin)
const crearEscenario = asyncHandler(async (req, res) => {
  const { nombre, descripcion, tipo_cambio, tasa_arancelaria, costo_logistico } = req.body;

  if (!nombre || tipo_cambio == null || tasa_arancelaria == null || costo_logistico == null) {
    res.status(400);
    throw new Error('nombre, tipo_cambio, tasa_arancelaria y costo_logistico son obligatorios');
  }

  const { data, error } = await supabase
    .from('escenarios')
    .insert({ nombre, descripcion, tipo_cambio, tasa_arancelaria, costo_logistico })
    .select()
    .single();

  if (error) {
    console.error('Error al crear el escenario:', error);
    res.status(500);
    throw new Error('Error al crear el escenario');
  }

  res.status(201).json(data);
});

// PUT /api/escenarios/:id  (admin)
const actualizarEscenario = asyncHandler(async (req, res) => {
  const campos = ['nombre', 'descripcion', 'tipo_cambio', 'tasa_arancelaria', 'costo_logistico', 'activo'];
  const updates = {};

  for (const campo of campos) {
    if (req.body[campo] !== undefined) updates[campo] = req.body[campo];
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No hay campos válidos para actualizar');
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('escenarios')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    console.error('Error al actualizar el escenario:', error);
    res.status(404);
    throw new Error('Escenario no encontrado');
  }

  res.json(data);
});

module.exports = { getEscenarios, getEscenario, crearEscenario, actualizarEscenario };
