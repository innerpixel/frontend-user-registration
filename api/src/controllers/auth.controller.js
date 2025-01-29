import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { config } from '../config/config.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user.toJSON());
};
