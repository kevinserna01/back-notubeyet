const CryptoJS = require('crypto-js');
const moment = require('moment-timezone');
const { connectDb, getDb } = require('../../database/mongo');
const Video = require('../../models/Video.js'); // Importar el modelo
const upload = require('../../aws/upload.js'); // Importar configuración de Multer-S3

// Controlador para registrar un usuario
const registerUser = async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  // Encriptamos la contraseña antes de guardarla
  const hashedPassword = CryptoJS.SHA256(contraseña, process.env.CODE_SECRET_DATA).toString();

  try {
    await connectDb(); // Conectar a la base de datos
    const db = getDb(); // Obtener la referencia a la base de datos

    // Verificar si el correo ya está registrado
    const existingUser = await db.collection('usuarios').findOne({ correo });
    if (existingUser) {
      return res.status(400).json({ status: "Error", message: "El correo ya está en uso" });
    }

    // Crear el nuevo usuario
    const newUser = {
      nombre,
      correo,
      contraseña: hashedPassword,
      role: 'usuario' // Establecemos el rol como 'usuario' por defecto
    };

    // Insertamos el nuevo usuario en la colección 'usuarios'
    await db.collection('usuarios').insertOne(newUser);
    res.status(201).json({ status: "Éxito", message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

// Controlador para login de usuario
const loginUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    await connectDb(); // Conectar a la base de datos
    const db = getDb(); // Obtener la referencia a la base de datos

    // Buscar al usuario por correo
    const user = await db.collection('usuarios').findOne({ correo });
    if (!user) {
      return res.status(400).json({ status: "Error", message: "Credenciales inválidas" });
    }

    // Comparar la contraseña cifrada
    const hashedPassword = CryptoJS.SHA256(contraseña, process.env.CODE_SECRET_DATA).toString();
    if (hashedPassword !== user.contraseña) {
      return res.status(400).json({ status: "Error", message: "Credenciales inválidas" });
    }

    // Obtener el nombre del usuario
    const nombreUsuario = user.nombre;

    // Responder al frontend con el nombre del usuario
    res.status(200).json({
      status: "",
      message: `Inicio de sesión exitoso, bienvenido ${nombreUsuario}`,
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ status: "Error", message: "Internal Server Error" });
  }
};

// Controlador para subir videos
const uploadVideo = async (req, res) => {
  upload.single('video')(req, res, async (err) => {
    if (err) {
      console.error('Error al subir el archivo:', err);
      return res.status(500).json({ error: 'Error al subir el archivo' });
    }

    try {
      const { title, description, uploadedBy } = req.body;

      // Validar campos requeridos
      if (!title || !description || !uploadedBy) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      }

      if (!req.file || !req.file.location) {
        return res.status(400).json({ error: 'El archivo no se subió correctamente' });
      }

      // Conectar a la base de datos
      await connectDb();
      const db = getDb();

      // Crear el documento del video
      const videoData = {
        title,
        description,
        fileUrl: req.file.location, // URL del archivo en S3
        uploadedBy, // Correo del usuario que subió el video
        uploadDate: new Date(),
      };

      // Insertar el video en la colección 'videos'
      const result = await db.collection('videos').insertOne(videoData);

      if (result.acknowledged) {
        console.log('Video guardado en la base de datos notubeyet');
        return res.status(201).json({
          message: 'Video subido y guardado con éxito',
          video: videoData, // Enviamos directamente los datos del video al cliente
        });
      } else {
        return res.status(500).json({ error: 'No se pudo guardar el video en la base de datos' });
      }
    } catch (error) {
      console.error('Error al guardar el video en la base de datos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};

// Controlador para obtener todos los videos
const getVideos = async (req, res) => {
  try {
    await connectDb(); // Conectar a la base de datos
    const db = getDb(); // Obtener la referencia a la base de datos

    // Obtener todos los videos de la colección 'videos'
    const videos = await db.collection('videos').find().toArray();

    if (videos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron videos' });
    }

    res.status(200).json(videos); // Enviar los videos como respuesta
  } catch (error) {
    console.error('Error al obtener los videos:', error);
    res.status(500).json({ message: 'Error al obtener los videos', error: error });
  }
};

// Controlador para obtener los videos de un usuario específico
const getUserVideos = async (req, res) => {
  const { email } = req.query; // Obtener el correo del usuario desde la consulta

  if (!email) {
    return res.status(400).json({ error: 'El correo del usuario es requerido.' });
  }

  try {
    await connectDb(); // Conectar a la base de datos
    const db = getDb();

    // Buscar los videos por el correo del usuario y ordenarlos por fecha (ascendente)
    const userVideos = await db.collection('videos')
      .find({ uploadedBy: email })
      .project({ uploadDate: 1, title: 1, fileUrl: 1 }) // Incluir solo los campos necesarios
      .sort({ uploadDate: 1 }) // Ordenar por fecha de subida (ascendente)
      .toArray();

    if (!userVideos.length) {
      return res.status(404).json({ message: 'No se encontraron videos para este usuario.' });
    }

    return res.status(200).json(userVideos);
  } catch (error) {
    console.error('Error al obtener los videos del usuario:', error);
    return res.status(500).json({ error: 'Error al obtener los videos del usuario.' });
  }
};

module.exports = { registerUser, loginUsuario, uploadVideo, getVideos, getUserVideos };
