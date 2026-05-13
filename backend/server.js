const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Godfather API is running...');
});

// Music Schema
const musicSchema = new mongoose.Schema({
  name: String,
  contentType: String,
  musicData: Buffer
});
const Music = mongoose.models.Music || mongoose.model('Music', musicSchema, 'music');

// Serve Godfather theme MP3 from DB
app.get('/api/music/theme', async (req, res) => {
  try {
    const music = await Music.findOne({ name: 'theme' });
    if (!music || !music.musicData) {
      return res.status(404).send('Audio file not found in database');
    }

    const buffer = music.musicData;
    const audioSize = buffer.length;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        'Content-Type': music.contentType || 'audio/mpeg',
        'Content-Length': audioSize,
        'Accept-Ranges': 'bytes'
      });
      return res.end(buffer);
    }

    const CHUNK_SIZE = 10 ** 6;
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, audioSize - 1);
    const contentLength = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${audioSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': music.contentType || 'audio/mpeg',
    });

    res.end(buffer.slice(start, end + 1));
  } catch (error) {
    console.error('Error fetching music:', error);
    res.status(500).send('Server Error');
  }
});

// Image Schema
const imageSchema = new mongoose.Schema({
  name: String,
  contentType: String,
  imageData: Buffer
});
const Image = mongoose.models.Image || mongoose.model('Image', imageSchema, 'images');

// Endpoint to stream images
app.get('/api/images/:name', async (req, res) => {
  try {
    const image = await Image.findOne({ name: req.params.name });
    if (!image || !image.imageData) {
      const filePath = path.join(__dirname, 'public', 'characters', req.params.name + '.jpg');
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      return res.status(404).send('Image not found');
    }
    
    res.set('Content-Type', image.contentType || 'image/jpeg');
    res.set('Content-Length', image.imageData.length);
    
    res.send(image.imageData);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Server Error');
  }
});

// Video Schema
const videoSchema = new mongoose.Schema({
  name: String,
  contentType: String,
  videoData: Buffer
});
const Video = mongoose.models.Video || mongoose.model('Video', videoSchema, 'videos');

// Endpoint to stream videos from DB
app.get('/api/videos/:name', async (req, res) => {
  try {
    console.log(`Video request for: ${req.params.name}`);
    const video = await Video.findOne({ name: req.params.name });
    console.log(`Video found in DB: ${video ? video.name : 'null'}`);
    if (!video || !video.videoData) {
      return res.status(404).send('Video not found');
    }
    
    const buffer = video.videoData;
    const size = buffer.length;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        'Content-Type': video.contentType || 'video/mp4',
        'Content-Length': size,
        'Accept-Ranges': 'bytes'
      });
      return res.end(buffer);
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, size - 1);
    const contentLength = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': video.contentType || 'video/mp4',
    });

    res.end(buffer.slice(start, end + 1));
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).send('Server Error');
  }
});

// Serve character images from filesystem
const CHAR_IMG_DIR = path.join(__dirname, 'public', 'characters');
app.get('/api/characters/:name', (req, res) => {
  const filePath = path.join(CHAR_IMG_DIR, req.params.name + '.jpg');
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Character image not found');
  }
  res.sendFile(filePath);
});

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/godfather';
mongoose.connect(mongoURI, { dbName: 'godfather' })
  .then(() => console.log('MongoDB connected to godfather database'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
