const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');
const { calcularSimulacion } = require('../utils/calculos');

// POST /api/simulaciones
const crearSimulacion = asyncHandler(async (req, res) => {
  const { escenario_id, precio_usd, volumen, costo_produccion, comisiones = 0 } = req.body;

  // 1. Validar inputs
  if (!escenario_id || !Number.isInteger(Number(escenario_id)) || Number(escenario_id) <= 0) {
    res.status(400);
    throw new Error('escenario_id es obligatorio y debe ser un entero positivo');
  }

  const validarNumero = (valor, nombre, opciones = {}) => {
    const n = Number(valor);
    if (valor === null || valor === undefined || valor === '' || !isFinite(n) || isNaN(n)) {
      res.status(400);
      throw new Error(`${nombre} debe ser un número válido`);
    }
    if (opciones.mayor_cero && n <= 0) {
      res.status(400);
      throw new Error(`${nombre} debe ser mayor a 0`);
    }
    if (opciones.mayor_igual_cero && n < 0) {
      res.status(400);
      throw new Error(`${nombre} debe ser mayor o igual a 0`);
    }
    return n;
  };

  const precioNum       = validarNumero(precio_usd,       'precio_usd',       { mayor_cero: true });
  const volumenNum      = validarNumero(volumen,           'volumen',          { mayor_cero: true });
  const costoNum        = validarNumero(costo_produccion, 'costo_produccion',  { mayor_igual_cero: true });
  const comisionesNum   = validarNumero(comisiones,       'comisiones',        { mayor_igual_cero: true });

  if (!Number.isInteger(volumenNum)) {
    res.status(400);
    throw new Error('volumen debe ser un entero');
  }

  // 2. Leer límites de configuración
  const { data: configRows } = await supabase
    .from('configuracion')
    .select('clave, valor')
    .in('clave', ['tipo_cambio_base', 'volumen_maximo', 'precio_usd_maximo']);

  const config = Object.fromEntries((configRows || []).map((r) => [r.clave, r.valor]));

  if (precioNum > Number(config.precio_usd_maximo)) {
    res.status(400);
    throw new Error(`precio_usd no puede superar ${config.precio_usd_maximo}`);
  }

  if (volumenNum > Number(config.volumen_maximo)) {
    res.status(400);
    throw new Error(`volumen no puede superar ${config.volumen_maximo}`);
  }

  // 3. Buscar escenario
  const { data: escenario, error: errEsc } = await supabase
    .from('escenarios')
    .select('*')
    .eq('id', Number(escenario_id))
    .single();

  if (errEsc || !escenario) {
    res.status(400);
    throw new Error('Escenario no encontrado');
  }

  if (!escenario.activo) {
    res.status(400);
    throw new Error('El escenario seleccionado no está activo');
  }

  // 4. tc_base de configuración
  const tc_base = Number(config.tipo_cambio_base);

  // 5. Calcular
  const resultados = calcularSimulacion({
    precio_usd:       precioNum,
    volumen:          volumenNum,
    costo_produccion: costoNum,
    comisiones:       comisionesNum,
    tipo_cambio:      Number(escenario.tipo_cambio),
    tasa_arancelaria: Number(escenario.tasa_arancelaria),
    costo_logistico:  Number(escenario.costo_logistico),
    tc_base,
  });

  // 6. Insertar
  const { data: simulacion, error: errIns } = await supabase
    .from('simulaciones')
    .insert({
      usuario_id:           req.usuario.id,
      escenario_id:         escenario.id,
      snap_nombre_escenario: escenario.nombre,
      snap_tipo_cambio:      escenario.tipo_cambio,
      snap_tasa_arancelaria: escenario.tasa_arancelaria,
      snap_costo_logistico:  escenario.costo_logistico,
      snap_tc_base:          tc_base,
      precio_usd:            precioNum,
      volumen:               volumenNum,
      costo_produccion:      costoNum,
      comisiones:            comisionesNum,
      ...resultados,
    })
    .select()
    .single();

  if (errIns) {
    res.status(500);
    throw new Error('Error al guardar la simulación');
  }

  res.status(201).json(simulacion);
});

// GET /api/simulaciones
const getSimulaciones = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const { data, error, count } = await supabase
    .from('simulaciones')
    .select('*', { count: 'exact' })
    .eq('usuario_id', req.usuario.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    res.status(500);
    throw new Error('Error al obtener simulaciones');
  }

  res.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
});

// GET /api/simulaciones/:id
const getSimulacion = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('simulaciones')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) {
    res.status(404);
    throw new Error('Simulación no encontrada');
  }

  if (data.usuario_id !== req.usuario.id && req.usuario.rol !== 'admin') {
    res.status(403);
    throw new Error('No tienes acceso a esta simulación');
  }

  res.json(data);
});

module.exports = { crearSimulacion, getSimulaciones, getSimulacion };
