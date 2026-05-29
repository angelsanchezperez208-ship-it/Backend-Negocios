const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');

// GET /api/reportes/resumen
const getResumen = asyncHandler(async (req, res) => {
  const [
    { count: totalUsuarios },
    { count: totalSimulaciones },
    { data: utilidades },
    { data: porEscenario },
  ] = await Promise.all([
    supabase.from('usuarios').select('*', { count: 'exact', head: true }),
    supabase.from('simulaciones').select('*', { count: 'exact', head: true }),
    supabase.from('simulaciones').select('utilidad_mxn'),
    supabase.from('simulaciones').select('escenario_id, snap_nombre_escenario'),
  ]);

  const utilidadPromedio =
    utilidades && utilidades.length > 0
      ? Math.round((utilidades.reduce((s, r) => s + Number(r.utilidad_mxn), 0) / utilidades.length) * 100) / 100
      : 0;

  const conteoEscenario = {};
  for (const { escenario_id, snap_nombre_escenario } of porEscenario || []) {
    if (!conteoEscenario[escenario_id]) {
      conteoEscenario[escenario_id] = { escenario_id, nombre: snap_nombre_escenario, total: 0 };
    }
    conteoEscenario[escenario_id].total++;
  }

  res.json({
    totalUsuarios,
    totalSimulaciones,
    utilidadPromedio,
    simulacionesPorEscenario: Object.values(conteoEscenario),
  });
});

// GET /api/reportes/usuario/:id
const getReporteUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const { data: usuario, error: errUser } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at')
    .eq('id', id)
    .single();

  if (errUser || !usuario) {
    console.error('Error al obtener usuario para reporte:', errUser);
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  const [
    { data: todasSimulaciones },
    { data: pagina, count },
  ] = await Promise.all([
    supabase.from('simulaciones').select('utilidad_mxn').eq('usuario_id', id),
    supabase
      .from('simulaciones')
      .select('*', { count: 'exact' })
      .eq('usuario_id', id)
      .order('created_at', { ascending: false })
      .range(from, to),
  ]);

  const totalSimulaciones = todasSimulaciones?.length || 0;
  const utilidadPromedio =
    totalSimulaciones > 0
      ? Math.round((todasSimulaciones.reduce((s, r) => s + Number(r.utilidad_mxn), 0) / totalSimulaciones) * 100) / 100
      : 0;

  res.json({
    usuario,
    totalSimulaciones,
    utilidadPromedio,
    simulaciones: {
      data: pagina,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    },
  });
});

// GET /api/reportes/escenario/:id
const getReporteEscenario = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: escenario, error: errEsc } = await supabase
    .from('escenarios')
    .select('*')
    .eq('id', id)
    .single();

  if (errEsc || !escenario) {
    console.error('Error al obtener escenario para reporte:', errEsc);
    res.status(404);
    throw new Error('Escenario no encontrado');
  }

  const { data: simulaciones } = await supabase
    .from('simulaciones')
    .select('utilidad_mxn')
    .eq('escenario_id', id);

  const total = simulaciones?.length || 0;
  let utilidadPromedio = 0;
  let utilidadMinima = 0;
  let utilidadMaxima = 0;
  let rentables = 0;
  let noRentables = 0;

  if (total > 0) {
    const utilidades = simulaciones.map((s) => Number(s.utilidad_mxn));
    utilidadPromedio = Math.round((utilidades.reduce((a, b) => a + b, 0) / total) * 100) / 100;
    utilidadMinima   = Math.min(...utilidades);
    utilidadMaxima   = Math.max(...utilidades);
    rentables        = utilidades.filter((u) => u > 0).length;
    noRentables      = total - rentables;
  }

  res.json({
    escenario,
    totalSimulaciones: total,
    utilidadPromedio,
    utilidadMinima,
    utilidadMaxima,
    rentables,
    noRentables,
  });
});

module.exports = { getResumen, getReporteUsuario, getReporteEscenario };
