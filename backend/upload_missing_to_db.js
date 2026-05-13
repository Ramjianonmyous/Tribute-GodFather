const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/godfather';

async function run() {
  try {
    await mongoose.connect(mongoURI, { dbName: 'godfather' });
    console.log('Connected to MongoDB');

    // Image Schema
    const imageSchema = new mongoose.Schema({
      name: String,
      contentType: String,
      imageData: Buffer
    });
    const Image = mongoose.models.Image || mongoose.model('Image', imageSchema, 'images');

    // 1. Upload Posters from Artifacts
    const artifacts = [
      { name: 'poster1_h', path: 'C:/Users/ramji/.gemini/antigravity/brain/80e33ec3-c6ef-4502-b0d6-f9d13c004289/poster1_horizontal_1778696264915.png' },
      { name: 'poster2_h', path: 'C:/Users/ramji/.gemini/antigravity/brain/80e33ec3-c6ef-4502-b0d6-f9d13c004289/poster2_horizontal_1778696306071.png' },
      { name: 'poster3_h', path: 'C:/Users/ramji/.gemini/antigravity/brain/80e33ec3-c6ef-4502-b0d6-f9d13c004289/poster3_horizontal_v2_1778696419295.png' },
      { name: 'poster4_h', path: 'C:/Users/ramji/.gemini/antigravity/brain/80e33ec3-c6ef-4502-b0d6-f9d13c004289/poster4_horizontal_v2_1778697090021.png' },
      { name: 'poster5_h', path: 'C:/Users/ramji/.gemini/antigravity/brain/80e33ec3-c6ef-4502-b0d6-f9d13c004289/poster5_horizontal_v3_1778697165394.png' }
    ];

    for (const art of artifacts) {
      if (fs.existsSync(art.path)) {
        const buffer = fs.readFileSync(art.path);
        await Image.findOneAndUpdate(
          { name: art.name },
          {
            name: art.name,
            contentType: 'image/png',
            imageData: buffer
          },
          { upsert: true, new: true }
        );
        console.log(`Uploaded poster: ${art.name}`);
      } else {
        console.log(`Poster file not found: ${art.path}`);
      }
    }

    // 2. Upload any files in public/characters (if user put them there)
    const charDir = path.join(__dirname, 'public', 'characters');
    if (fs.existsSync(charDir)) {
      const files = fs.readdirSync(charDir);
      for (const file of files) {
        if (file.endsWith('.jpg') || file.endsWith('.png')) {
          const name = path.parse(file).name;
          const filePath = path.join(charDir, file);
          const buffer = fs.readFileSync(filePath);
          
          await Image.findOneAndUpdate(
            { name: name },
            {
              name: name,
              contentType: file.endsWith('.png') ? 'image/png' : 'image/jpeg',
              imageData: buffer
            },
            { upsert: true, new: true }
          );
          console.log(`Uploaded image from public folder: ${name}`);
        }
      }
    }

    console.log('Upload complete');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
