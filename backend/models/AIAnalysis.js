const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  // Quality Analysis Results
  qualityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  purityPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  predictedPrice: {
    type: Number,
    min: 0
  },
  authenticityScore: {
    type: Number,
    min: 0,
    max: 1
  },
  confidenceLevel: {
    type: Number,
    min: 0,
    max: 1
  },
  
  // Color Analysis
  colorAnalysis: {
    dominantColors: [{
      color: String,
      percentage: Number,
      hex: String
    }],
    colorVariation: Number,
    freshness: Number,
    hslValues: {
      h: Number,
      s: Number,
      l: Number
    }
  },
  
  // Texture Analysis
  textureAnalysis: {
    roughness: Number,
    uniformity: Number,
    moisture: Number,
    edgeDetection: Number,
    surfaceArea: Number
  },
  
  // Size Analysis
  sizeAnalysis: {
    averageSize: Number,
    sizeVariation: Number,
    count: Number,
    totalArea: Number,
    aspectRatio: Number
  },
  
  // Defects Detected
  defectsDetected: [String],
  
  // AI Recommendations
  recommendations: [String],
  
  // Processing Details
  processingDetails: {
    imageResolution: {
      width: Number,
      height: Number
    },
    fileSize: Number,
    analysisTime: Number, // in milliseconds
    pixelsAnalyzed: Number
  },
  
  modelVersion: {
    type: String,
    default: 'v2.0'
  }
}, {
  timestamps: true
});

// Indexes
aiAnalysisSchema.index({ batchId: 1 });
aiAnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);

