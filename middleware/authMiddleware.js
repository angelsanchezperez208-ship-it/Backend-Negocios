const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('No autorizado: falta el token');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('No autorizado: token inválido o expirado');
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol')
    .eq('id', decoded.id)
    .single();

  if (error || !usuario) {
    res.status(401);
    throw new Error('No autorizado: usuario no encontrado');
  }

  req.usuario = usuario;
  next();
});

const soloAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Acceso denegado: se requiere rol admin');
};

module.exports = { protect, soloAdmin };
