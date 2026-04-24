// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Inicializar variables de entorno
dotenv.config();

// Inicializar Firebase (Esto validará las credenciales al arrancar)
require('./config/firebase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares Globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba para confirmar que el servidor está vivo
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Enlapet 2.0 Backend is running smoothly 🐾' });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
