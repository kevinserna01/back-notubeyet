const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: String, // correo del usuario
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'videos' });

const Video = mongoose.model('Video', videoSchema);

// Establecer la base de datos directamente
Video.db = mongoose.connection.useDb('notubeyet');

module.exports = Video;
