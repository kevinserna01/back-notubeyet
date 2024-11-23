const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { registerUser, loginUsuario,uploadVideo,getVideos,getUserVideos } = require('./controllers/tubeyetControllers');
const upload = require('../aws/upload'); // Importa tu configuración de Multer-S3
const router = express.Router();

dotenv.config({ path: './config.env' });

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
       console.log('Conexión exitosa a MongoDB');
   })
   .catch(err => {
       console.error('Error al conectar a MongoDB:', err);
   });

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUsuario);
router.post('/uploadVideo', uploadVideo);
router.get('/getVideos', getVideos);
router.get('/getUserVideos', getUserVideos);

// Ruta de carga de videos a S3
router.post('/upload', upload.single('video'), (req, res) => {
   try {
       const fileUrl = req.file.location; // Obtiene la URL del archivo en S3
       res.status(200).json({ message: 'Archivo subido con éxito', fileUrl });
   } catch (error) {
       console.error('Error al subir el archivo:', error);
       res.status(500).json({ error: 'Error al subir el archivo' });
   }
});

module.exports = router;
