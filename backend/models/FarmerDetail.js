const mongoose = require('mongoose');

const farmerDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Information
  farmerAge: {
    type: Number,
    min: [18, 'Farmer must be at least 18 years old'],
    max: [100, 'Invalid age']
  },
  farmingExperience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [80, 'Invalid experience']
  },
  completeAddress: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Farm Information
  farmName: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [200, 'Farm name cannot exceed 200 characters']
  },
  farmLocation: {
    type: String,
    required: [true, 'Farm location is required'],
    trim: true
  },
  farmSize: {
    type: Number,
    required: [true, 'Farm size is required'],
    min: [0.1, 'Farm size must be at least 0.1 acres']
  },
  gpsLatitude: {
    type: Number,
    min: -90,
    max: 90
  },
  gpsLongitude: {
    type: Number,
    min: -180,
    max: 180
  },
  
  // Farming Details
  soilType: {
    type: String
  },
  waterSource: {
    type: String
  },
  irrigationMethod: {
    type: String
  },
  primaryCrop: {
    type: String
  },
  annualProduction: {
    type: Number,
    min: 0
  },
  cropRotation: {
    type: String,
    trim: true
  },
  farmingPractices: [{
    type: String,
    enum: ['Organic', 'Natural', 'Biodynamic', 'Traditional', 'Sustainable', 'Integrated']
  }],
  processingCapabilities: [{
    type: String,
    enum: ['Washing', 'Drying', 'Grinding', 'Packaging']
  }],
  
  // Certifications
  certifications: [{
    type: String
  }],
  
  // Approval Status
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Documents URLs
  landProofUrl: {
    type: String,
    trim: true
  },
  aadhaarUrl: {
    type: String,
    trim: true
  },
  organicCertUrl: {
    type: String,
    trim: true
  },
  farmPhotosUrls: [{
    type: String,
    trim: true
  }],

  // Payout / Payment Details
  bankAccountHolderName: {
    type: String,
    trim: true
  },
  bankAccountNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  bankBranch: {
    type: String,
    trim: true
  },
  bankIFSCCode: {
    type: String,
    trim: true
  },
  upiId: {
    type: String,
    trim: true
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'none'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Index for search queries
farmerDetailSchema.index({ approvalStatus: 1 });
farmerDetailSchema.index({ farmLocation: 'text', farmName: 'text' });

module.exports = mongoose.model('FarmerDetail', farmerDetailSchema);

