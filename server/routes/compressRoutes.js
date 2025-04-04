import express from 'express';
import * as dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

dotenv.config();

const router = express.Router();

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

router.route('/').post(upload.single('image'), async (req, res) => {
  try {
    const image = req.file;
    const quality = parseInt(req.body.quality) || 80;

    if (!image) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Get original image size in bytes
    const originalSize = image.size;

    // Generate unique filename
    const filename = `compressed-${uuidv4()}.jpg`;
    const outputPath = path.join(uploadsDir, filename);

    // Compress the image using Sharp
    await sharp(image.buffer)
      .jpeg({ quality })
      .toFile(outputPath);

    // Get compressed file size
    const compressedStats = fs.statSync(outputPath);
    const compressedSize = compressedStats.size;

    // Calculate compression ratio (how much smaller the file is)
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    // Create URL for the compressed image
    const compressedImageUrl = `http://localhost:8080/uploads/${filename}`;

    res.status(200).json({
      success: true,
      compressedImageUrl,
      originalSize,
      compressedSize,
      compressionRatio,
      quality
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error compressing image' });
  }
});

export default router; 