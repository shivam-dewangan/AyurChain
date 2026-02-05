const mongoose = require('mongoose');

const fraudDetectionSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Risk Factors
  riskFactors: [String],
  
  // Image Analysis
  imageSimilarityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Metadata Analysis
  metadataAnomalies: {
    location: String,
    fileSize: String,
    uploadTime: String
  },
  
  // Behavioral Flags
  behavioralFlags: [String],
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'flagged'],
    default: 'pending'
  },
  
  analyzedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
fraudDetectionSchema.index({ batchId: 1 });
fraudDetectionSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('FraudDetection', fraudDetectionSchema);

