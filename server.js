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

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.json({ status: 'ok', proyecto: 'Simulador Negocios Int' }));

app.use('/api/usuarios',      usuarioRoutes);
app.use('/api/escenarios',    escenarioRoutes);
app.use('/api/simulaciones',  simulacionRoutes);
app.use('/api/reportes',      reporteRoutes);
app.use('/api/configuracion', configuracionRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
