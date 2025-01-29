import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/config.js';

export const uploadFile = async (file, subdir = '') => {
  const uploadDir = path.join(config.uploads.path, subdir);
  
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);
    
    await fs.writeFile(filepath, file.buffer);
    
    return path.join('/uploads', subdir, filename);
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

export const deleteFile = async (filepath) => {
  try {
    const fullPath = path.join(config.uploads.path, filepath);
    await fs.unlink(fullPath);
  } catch (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
};
