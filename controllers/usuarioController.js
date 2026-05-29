const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const generarToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/usuarios/registro
const registro = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    res.status(400);
    throw new Error('Nombre, email y contraseña son obligatorios');
  }

  const { data: existente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existente) {
    res.status(400);
    throw new Error('El email ya está registrado');
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .insert({ nombre, email, password_hash })
    .select('id, nombre, email, rol')
    .single();

  if (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500);
    throw new Error('Error al crear el usuario');
  }

  res.status(201).json({
    _id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    token: generarToken(usuario.id),
  });
});

// POST /api/usuarios/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email y contraseña son obligatorios');
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, password_hash')
    .eq('email', email)
    .single();

  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  res.json({
    _id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    token: generarToken(usuario.id),
  });
});

// GET /api/usuarios/perfil
const getPerfil = asyncHandler(async (req, res) => {
  res.json(req.usuario);
});

// PUT /api/usuarios/perfil
const updatePerfil = asyncHandler(async (req, res) => {
  const { nombre, email } = req.body;
  const updates = {};

  if (nombre) updates.nombre = nombre;

  if (email && email !== req.usuario.email) {
    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .neq('id', req.usuario.id)
      .maybeSingle();

    if (existente) {
      res.status(400);
      throw new Error('El email ya está en uso');
    }
    updates.email = email;
  }

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No hay campos válidos para actualizar');
  }

  const { data: actualizado, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', req.usuario.id)
    .select('id, nombre, email, rol')
    .single();

  if (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500);
    throw new Error('Error al actualizar el perfil');
  }

  res.json(actualizado);
});

// GET /api/usuarios  (admin)
const getUsuarios = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const { data, error, count } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500);
    throw new Error('Error al obtener usuarios');
  }

  res.json({
    data,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  });
});

// PATCH /api/usuarios/:id/rol  (admin)
const cambiarRol = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (id === req.usuario.id) {
    res.status(400);
    throw new Error('No puedes cambiar tu propio rol');
  }

  if (!['estudiante', 'admin'].includes(rol)) {
    res.status(400);
    throw new Error('Rol inválido. Valores permitidos: estudiante, admin');
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ rol })
    .eq('id', id)
    .select('id, nombre, email, rol')
    .single();

  if (error || !data) {
    console.error('Error al cambiar rol de usuario:', error);
    res.status(404);
    throw new Error('Usuario no encontrado');
  }

  res.json(data);
});

// DELETE /api/usuarios/:id  (admin)
const eliminarUsuario = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.usuario.id) {
    res.status(400);
    throw new Error('No puedes eliminarte a ti mismo');
  }

  const { error } = await supabase.from('usuarios').delete().eq('id', id);

  if (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500);
    throw new Error('Error al eliminar el usuario');
  }

  res.json({ message: 'Usuario eliminado correctamente' });
});

module.exports = { registro, login, getPerfil, updatePerfil, getUsuarios, cambiarRol, eliminarUsuario };
