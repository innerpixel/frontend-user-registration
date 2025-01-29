import User from '../models/user.model.js';
import { uploadFile, deleteFile } from '../utils/file.js';

export const getAllProfiles = async (req, res) => {
  try {
    const users = await User.find().select('username profile createdAt');
    const profiles = users.map(user => user.getPublicProfile());
    res.json(profiles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Only allow users to update their own profile
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      user.profile[key] = updates[key];
    });

    await user.save();
    res.json(user.getPublicProfile());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Only allow users to update their own avatar
    if (req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old avatar if exists
    if (user.profile.avatar) {
      await deleteFile(user.profile.avatar);
    }

    const avatarUrl = await uploadFile(req.file, 'avatars');
    user.profile.avatar = avatarUrl;
    await user.save();

    res.json({ avatar: avatarUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
