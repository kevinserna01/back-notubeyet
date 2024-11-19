const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI; // URI de la base de datos (e.g., MongoDB Atlas o local)

// Conexión a la base de datos
const connectDb = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Conexión exitosa a la base de datos notubeyet');

    // Eventos de la conexión
    mongoose.connection.on('disconnected', () => {
      console.warn('Desconectado de la base de datos.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Reconectado a la base de datos.');
    });

  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    throw new Error('Error de conexión a la base de datos');
  }
};

// Obtener la conexión actual de Mongoose
const getDb = () => mongoose.connection;

// Exportar las funciones
module.exports = { connectDb, getDb };
