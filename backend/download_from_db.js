const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/godfather';

async function run() {
  try {
    await mongoose.connect(mongoURI, { dbName: 'godfather' });
    console.log('Connected to MongoDB');

    // Schemas
    const imageSchema = new mongoose.Schema({ name: String, contentType: String, imageData: Buffer });
    const Image = mongoose.models.Image || mongoose.model('Image', imageSchema, 'images');

    const videoSchema = new mongoose.Schema({ name: String, videoData: Buffer });
    const Video = mongoose.models.Video || mongoose.model('Video', videoSchema, 'videos');

    const musicSchema = new mongoose.Schema({ name: String, musicData: Buffer });
    const Music = mongoose.models.Music || mongoose.model('Music', musicSchema, 'music');

    // Ensure directories exist
    const publicDir = path.join(__dirname, '..', 'frontend', 'public');
    const imagesDir = path.join(publicDir, 'images');
    const videosDir = path.join(publicDir, 'videos');
    const musicDir = path.join(publicDir, 'music');

    fs.mkdirSync(imagesDir, { recursive: true });
    fs.mkdirSync(videosDir, { recursive: true });
    fs.mkdirSync(musicDir, { recursive: true });

    // 1. Download Images
    const images = await Image.find({});
    console.log(`Found ${images.length} images in DB`);
    for (const img of images) {
      const ext = img.contentType === 'image/png' ? 'png' : 'jpg';
      const filePath = path.join(imagesDir, `${img.name}.${ext}`);
      fs.writeFileSync(filePath, img.imageData);
      console.log(`Saved image: ${img.name}.${ext}`);
    }

    // 2. Download Videos
    const videos = await Video.find({});
    console.log(`Found ${videos.length} videos in DB`);
    for (const vid of videos) {
      const filePath = path.join(videosDir, `${vid.name}.mp4`);
      fs.writeFileSync(filePath, vid.videoData);
      console.log(`Saved video: ${vid.name}.mp4`);
    }

    // 3. Download Music
    const music = await Music.find({});
    console.log(`Found ${music.length} music files in DB`);
    for (const mus of music) {
      const filePath = path.join(musicDir, `${mus.name}.mp3`);
      if (mus.musicData) {
        fs.writeFileSync(filePath, mus.musicData);
        console.log(`Saved music: ${mus.name}.mp3`);
      } else {
        console.log(`Music data missing for: ${mus.name}`);
      }
    }

    console.log('Download complete');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
