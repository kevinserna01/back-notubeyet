const express = require('express');
const { urlencoded, json } = require('express');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes/tubeyet.routes.js'); // Asegúrate de que la ruta sea correcta

const app = express();

// Middleware para analizar datos codificados y JSON con un límite ampliado
app.use(json({ limit: '50mb' })); // Aumenta el límite para JSON
app.use(urlencoded({ limit: '50mb', extended: true })); // Aumenta el límite para datos codificados

// Configuración de CORS
const allowedOrigins = ['https://front-notubeyet.vercel.app'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Manejador para la ruta raíz
app.get('/', (req, res) => {
    res.send('Bienvenido al backend de NotubeYet!');
});

// Utiliza las rutas del sistema
app.use('/v1/tubeyet', router);

// Iniciar el servidor
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
