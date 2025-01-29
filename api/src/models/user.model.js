import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: {
      type: String,
      maxLength: 500,
    },
    publicEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    website: String,
    social: {
      github: String,
      twitter: String,
      linkedin: String,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

// Remove sensitive information from JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    username: this.username,
    profile: this.profile,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
