import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: /^[a-z][a-z0-9_-]{2,15}$/
    },
    displayName: {
        type: String,
        required: true,
        unique: true,
        minLength: 3
    },
    systemEmail: {
        type: String,
        required: true,
        unique: true
    },
    personalEmail: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true
    },
    simFrequency: {
        type: String,
        required: true,
        unique: true,
        match: /^CSMC\d{3}$/
    },
    registrationStatus: {
        type: String,
        enum: [
            'INITIATED',
            'USERNAME_VALIDATED',
            'USER_CREATED',
            'SYSTEM_USER_CREATED',
            'MAIL_CONFIGURED',
            'VERIFICATION_SENT',
            'VERIFIED',
            'FAILED'
        ],
        default: 'INITIATED'
    },
    statusDetails: {
        lastStep: String,
        error: String,
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: Date,
    lastLoginAt: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    
    // Update statusDetails.lastUpdated on status change
    if (this.isModified('registrationStatus')) {
        this.statusDetails.lastUpdated = new Date();
    }
    next();
});

// Method to validate password
userSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Method to update registration status
userSchema.methods.updateStatus = async function(status, details = {}) {
    this.registrationStatus = status;
    if (details.error) {
        this.statusDetails.error = details.error;
    }
    if (details.lastStep) {
        this.statusDetails.lastStep = details.lastStep;
    }
    this.statusDetails.lastUpdated = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);

export default User;
