const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Configuración de AWS S3 (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuración de multer para cargar archivos a S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME, // Asegúrate de que esta variable de entorno esté correctamente definida
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `${Date.now().toString()}-${file.originalname}`;
      cb(null, uniqueName); // Genera un nombre único para el archivo
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // S3 detectará el tipo de contenido automáticamente
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // Límite de tamaño de archivo: 50MB
  },
});

module.exports = upload;
