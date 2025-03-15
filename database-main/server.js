const express = require('express');
const cors = require('cors');
const path = require('path');
const { databaseMiddleware } = require('./middleware/database');
const morgan = require('morgan');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin');
const robloxRoutes = require('./routes/roblox');
const settingsRoutes = require('./routes/settings');
const usersRoutes = require('./routes/users');
const giftRoutes = require('./routes/gifts');
const fortniteRoutes = require('./routes/fortnite');
const gamesRoutes = require('./routes/games');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const gameAccountsRoutes = require('./routes/gameAccounts');
const paymentProofsRoutes = require('./routes/paymentProofs');
const extrasRoutes = require('./routes/extras');

require('dotenv').config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://blixgg.com',
      'http://localhost:5173',
      'https://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      undefined // Permitir solicitudes sin origen (como Postman)
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight por 10 minutos
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(databaseMiddleware);
app.use(morgan('dev'));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // Capturar la respuesta
  const oldSend = res.send;
  res.send = function (data) {
    console.log(`[${timestamp}] Response:`, data);
    oldSend.apply(res, arguments);
  };
  
  next();
});

// Asegurarse de que el directorio existe
const uploadsDir = path.join(__dirname, 'uploads');
const paymentProofsDir = path.join(uploadsDir, 'payment_proofs');
const gamesDir = path.join(uploadsDir, 'games');
const robloxDir = path.join(uploadsDir, 'roblox');
const extrasDir = path.join(uploadsDir, 'extras');

// Crear directorios si no existen
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}
if (!require('fs').existsSync(paymentProofsDir)) {
  require('fs').mkdirSync(paymentProofsDir, { recursive: true });
}
if (!require('fs').existsSync(gamesDir)) {
  require('fs').mkdirSync(gamesDir, { recursive: true });
}
if (!require('fs').existsSync(robloxDir)) {
  require('fs').mkdirSync(robloxDir, { recursive: true });
}
if (!require('fs').existsSync(extrasDir)) {
  require('fs').mkdirSync(extrasDir, { recursive: true });
}

// Configurar middleware para servir archivos estáticos
app.use('/db/uploads', express.static(uploadsDir));
app.use('/db/uploads/payment_proofs', express.static(paymentProofsDir));
app.use('/db/uploads/games', express.static(gamesDir));
app.use('/db/uploads/roblox', express.static(robloxDir));
app.use('/db/uploads/extras', express.static(extrasDir));

// También servir los archivos sin el prefijo /db para compatibilidad
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads/payment_proofs', express.static(paymentProofsDir));
app.use('/uploads/games', express.static(gamesDir));
app.use('/uploads/roblox', express.static(robloxDir));
app.use('/uploads/extras', express.static(extrasDir));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rutas con el prefijo /db
app.use('/db/api/auth', authRoutes);
app.use('/db/api/admin', adminRoutes);
app.use('/db/api/roblox', robloxRoutes);
app.use('/db/api/settings', settingsRoutes);
app.use('/db/api/users', usersRoutes);
app.use('/db/api/gifts', giftRoutes);
app.use('/db/api/fortnite', fortniteRoutes);
app.use('/db/api/admin/games', gamesRoutes);
app.use('/db/api/products', productsRoutes);
app.use('/db/api/orders', ordersRoutes);
app.use('/db/api/game-accounts', gameAccountsRoutes);
app.use('/db/api/payment-proofs', paymentProofsRoutes);
app.use('/db/api/extras', extrasRoutes);

// Ruta de prueba
app.get('/db', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Puerto para el servidor
const port = process.env.PORT || 10000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'production'}`);
  console.log(`URL base: ${process.env.NODE_ENV === 'development' ? `http://localhost:${port}/db` : 'https://blixgg.com/db'}`);
});
