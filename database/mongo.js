const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI; // URI con el nombre de base de datos (notubeyet)

// Conexión a la base de datos
const connectDb = async () => {
  try {
    // Nos conectamos a MongoDB con la URI proporcionada (la que contiene el nombre de la base de datos)
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conexión exitosa a la base de datos notubeyet');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw new Error('Error de conexión a la base de datos');
  }
};

// Devolver la conexión actual de Mongoose si es necesario
const getDb = () => {
  return mongoose.connection;
};

module.exports = { connectDb, getDb };
