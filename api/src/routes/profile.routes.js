import express from 'express';
import multer from 'multer';
import { getAllProfiles, getProfileByUsername, updateProfile, uploadAvatar } from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { config } from '../config/config.js';

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: config.uploads.maxSize,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Please upload an image file'));
    }
    cb(null, true);
  },
});

router.get('/', getAllProfiles);
router.get('/:username', getProfileByUsername);
router.put('/:username', authenticate, updateProfile);
router.post('/:username/avatar', authenticate, upload.single('avatar'), uploadAvatar);

export default router;
