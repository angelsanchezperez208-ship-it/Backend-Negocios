require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');

const usuarioRoutes      = require('./routes/usuarioRoutes');
const escenarioRoutes    = require('./routes/escenarioRoutes');
const simulacionRoutes   = require('./routes/simulacionRoutes');
const reporteRoutes      = require('./routes/reporteRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/usuarios',      usuarioRoutes);
app.use('/api/escenarios',    escenarioRoutes);
app.use('/api/simulaciones',  simulacionRoutes);
app.use('/api/reportes',      reporteRoutes);
app.use('/api/configuracion', configuracionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
