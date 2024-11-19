const express = require('express');
const { urlencoded, json } = require('express');
const cors = require('cors');
require('dotenv').config();
const router = require('./routes/tubeyet.routes.js'); // Cambia esta ruta según tus necesidades

const app = express();

// Middleware para analizar datos codificados y JSON
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());

// Manejador para la ruta raíz
app.get('/', (req, res) => {
    res.send('Bienvenido al backend de NotubeYet!');
});

// Utiliza las rutas de usuario (login, registro, etc.)
app.use('/v1/tubeyet', router); // Cambia 'users' por el endpoint adecuado

// Iniciar el servidor
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
