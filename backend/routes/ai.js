const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const AIAnalysis = require('../models/AIAnalysis');
const FraudDetection = require('../models/FraudDetection');
const Batch = require('../models/Batch');

// @route   POST /api/ai/analyze
// @desc    Analyze herb image quality
// @access  Private
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { batchId, imageUrl, herbName } = req.body;

    if (!batchId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID and image URL are required'
      });
    }

    // Check batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Simulate AI analysis (in real implementation, this would call ML model)
    // For now, returning realistic mock data based on the original frontend AI service
    const qualityScore = 0.7 + Math.random() * 0.25; // 0.70-0.95
    const purityPercentage = 75 + Math.random() * 20; // 75-95%
    const authenticityScore = 0.8 + Math.random() * 0.15; // 0.80-0.95

    // Color analysis simulation
    const dominantColors = [
      { color: 'brown', percentage: 45 + Math.random() * 20, hex: '#8B4513' },
      { color: 'tan', percentage: 20 + Math.random() * 15, hex: '#D2B48C' },
      { color: 'beige', percentage: 15 + Math.random() * 10, hex: '#F5F5DC' }
    ];

    // Texture analysis simulation
    const textureAnalysis = {
      roughness: 0.3 + Math.random() * 0.4,
      uniformity: 0.6 + Math.random() * 0.35,
      moisture: 0.3 + Math.random() * 0.4,
      edgeDetection: 0.2 + Math.random() * 0.3,
      surfaceArea: 10000 + Math.random() * 50000
    };

    // Size analysis simulation
    const sizeAnalysis = {
      averageSize: 3 + Math.random() * 5,
      sizeVariation: 0.2 + Math.random() * 0.3,
      count: Math.floor(10 + Math.random() * 50),
      totalArea: 5000 + Math.random() * 20000,
      aspectRatio: 0.8 + Math.random() * 0.4
    };

    // Calculate price based on quality
    const basePrices = {
      'Ashwagandha': 800,
      'Turmeric': 600,
      'Amla': 400,
      'Ginger': 350,
      'Neem': 300
    };
    const basePrice = basePrices[herbName] || 500;
    const predictedPrice = Math.round(basePrice * (0.7 + qualityScore * 0.8) * (0.8 + (purityPercentage - 60) / 100));

    // Defects detection
    const defectsDetected = [];
    if (textureAnalysis.moisture > 0.6) defectsDetected.push('excess_moisture');
    if (textureAnalysis.uniformity < 0.5) defectsDetected.push('surface_damage');
    if (sizeAnalysis.sizeVariation > 0.5) defectsDetected.push('size_inconsistency');

    // Generate recommendations
    const recommendations = [];
    if (qualityScore < 0.7) {
      recommendations.push("Implement stricter harvesting protocols");
      recommendations.push("Review post-harvest processing methods");
    } else if (qualityScore < 0.85) {
      recommendations.push("Fine-tune harvesting timing for optimal maturity");
      recommendations.push("Enhance sorting and grading processes");
    }

    if (purityPercentage < 85) {
      recommendations.push("Implement multi-stage cleaning process");
      recommendations.push("Use mechanical separation for foreign matter removal");
    }

    defectsDetected.forEach(defect => {
      switch (defect) {
        case 'excess_moisture':
          recommendations.push("Extend drying time or reduce drying temperature");
          break;
        case 'surface_damage':
          recommendations.push("Handle with care during processing");
          break;
      }
    });

    if (qualityScore > 0.85 && purityPercentage > 92) {
      recommendations.push("Excellent quality achieved - consider premium certification");
    }

    // Save analysis result
    const analysis = await AIAnalysis.create({
      batchId,
      imageUrl,
      qualityScore,
      purityPercentage,
      predictedPrice,
      authenticityScore,
      confidenceLevel: 0.85,
      colorAnalysis: {
        dominantColors,
        colorVariation: Math.random() * 0.3,
        freshness: 0.7 + Math.random() * 0.25,
        hslValues: { h: 30 + Math.random() * 20, s: 30 + Math.random() * 40, l: 40 + Math.random() * 30 }
      },
      textureAnalysis,
      sizeAnalysis,
      defectsDetected,
      recommendations,
      processingDetails: {
        imageResolution: { width: 1024, height: 1024 },
        fileSize: 50000 + Math.random() * 150000,
        analysisTime: Math.floor(1000 + Math.random() * 2000),
        pixelsAnalyzed: 1024 * 1024
      }
    });

    // Update batch with AI suggested price
    await Batch.findByIdAndUpdate(batchId, { pricePerKg: predictedPrice });

    res.json({
      success: true,
      data: {
        qualityScore,
        purityPercentage,
        predictedPrice,
        authenticityScore,
        confidenceLevel: 0.85,
        colorAnalysis: {
          dominantColors,
          colorVariation: Math.random() * 0.3,
          freshness: 0.7 + Math.random() * 0.25,
          hslValues: { h: 30 + Math.random() * 20, s: 30 + Math.random() * 40, l: 40 + Math.random() * 30 }
        },
        textureAnalysis,
        sizeAnalysis,
        defectsDetected,
        recommendations,
        analysisId: analysis._id
      }
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing AI analysis',
      error: error.message
    });
  }
});

// @route   POST /api/ai/fraud-detect
// @desc    Detect potential fraud
// @access  Private
router.post('/fraud-detect', authenticate, async (req, res) => {
  try {
    const { batchId, imageUrl, metadata } = req.body;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required'
      });
    }

    // Simulate fraud detection analysis
    const riskScore = Math.random() * 0.4; // Most are low risk
    const riskFactors = [];
    const behavioralFlags = [];

    // Check upload time
    const uploadHour = new Date().getHours();
    if (uploadHour < 5 || uploadHour > 23) {
      riskFactors.push('Unusual upload time (outside normal hours)');
    }

    // Random image similarity check (simulated)
    const imageSimilarityScore = Math.random() * 0.3;

    // Metadata checks
    const metadataAnomalies = {};
    if (!metadata?.location) {
      metadataAnomalies.location = 'GPS location data missing or invalid';
    }

    // Determine verification status
    let verificationStatus = 'verified';
    if (riskScore > 0.6) {
      verificationStatus = 'flagged';
    } else if (riskScore > 0.3) {
      verificationStatus = 'pending';
    }

    // Save fraud detection result
    const fraudDetection = await FraudDetection.create({
      batchId,
      riskScore,
      riskFactors,
      imageSimilarityScore,
      metadataAnomalies,
      behavioralFlags,
      verificationStatus
    });

    res.json({
      success: true,
      data: {
        riskScore,
        riskFactors,
        imageSimilarityScore,
        metadataAnomalies,
        behavioralFlags,
        verificationStatus,
        fraudId: fraudDetection._id
      }
    });
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing fraud detection',
      error: error.message
    });
  }
});

// @route   GET /api/ai/analysis/:batchId
// @desc    Get AI analysis for a batch
// @access  Private
router.get('/analysis/:batchId', authenticate, async (req, res) => {
  try {
    const analysis = await AIAnalysis.find({ batchId: req.params.batchId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Get AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI analysis',
      error: error.message
    });
  }
});

// @route   GET /api/ai/fraud/:batchId
// @desc    Get fraud detection for a batch
// @access  Private
router.get('/fraud/:batchId', authenticate, async (req, res) => {
  try {
    const fraudDetection = await FraudDetection.find({ batchId: req.params.batchId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: fraudDetection
    });
  } catch (error) {
    console.error('Get fraud detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fraud detection',
      error: error.message
    });
  }
});

module.exports = router;

