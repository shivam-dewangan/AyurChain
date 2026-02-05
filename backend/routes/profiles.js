const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const User = require('../models/User');
const FarmerDetail = require('../models/FarmerDetail');
const CompanyDetail = require('../models/CompanyDetail');

// @route   POST /api/profiles/farmer
// @desc    Create or update farmer profile
// @access  Private (Farmer only)
router.post('/farmer', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const {
      farmName,
      farmLocation,
      farmSize,
      soilType,
      waterSource,
      irrigationMethod,
      farmingPractices,
      primaryCrop,
      annualProduction,
      cropRotation,
      processingCapabilities,
      certifications,
      landProofUrl,
      aadhaarUrl,
      organicCertUrl,
      farmPhotosUrls,
      gpsLatitude,
      gpsLongitude,
      farmerAge,
      farmingExperience,
      completeAddress,
      phoneNumber,
      emailAddress
    } = req.body;

    // Update user phone if provided
    if (phoneNumber) {
      await User.findByIdAndUpdate(req.user.id, { phone: phoneNumber });
    }

    // Check if farmer profile exists
    let farmerDetail = await FarmerDetail.findOne({ userId: req.user.id });

    const profileData = {
      userId: req.user.id,
      farmName,
      farmLocation,
      farmSize: parseFloat(farmSize),
      soilType,
      waterSource,
      irrigationMethod,
      farmingPractices: farmingPractices || [],
      primaryCrop,
      annualProduction: annualProduction ? parseFloat(annualProduction) : undefined,
      cropRotation,
      processingCapabilities: processingCapabilities || [],
      certifications: certifications || [],
      landProofUrl,
      aadhaarUrl,
      organicCertUrl,
      farmPhotosUrls: farmPhotosUrls || [],
      gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : undefined,
      gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : undefined,
      farmerAge: farmerAge ? parseInt(farmerAge) : undefined,
      farmingExperience: farmingExperience ? parseInt(farmingExperience) : undefined,
      completeAddress,
      phoneNumber,
      emailAddress,
      approvalStatus: 'pending'
    };

    if (farmerDetail) {
      // Update existing
      Object.assign(farmerDetail, profileData);
      await farmerDetail.save();
    } else {
      // Create new
      farmerDetail = new FarmerDetail(profileData);
      await farmerDetail.save();
    }

    res.json({
      success: true,
      data: farmerDetail
    });
  } catch (error) {
    console.error('Farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving farmer profile',
      error: error.message
    });
  }
});

// @route   GET /api/profiles/farmer
// @desc    Get current farmer's profile
// @access  Private (Farmer only)
router.get('/farmer', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const farmerDetail = await FarmerDetail.findOne({ userId: req.user.id });

    if (!farmerDetail) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    res.json({
      success: true,
      data: farmerDetail
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer profile',
      error: error.message
    });
  }
});

// @route   POST /api/profiles/company
// @desc    Create or update company profile
// @access  Private (Company only)
router.post('/company', authenticate, requireRole('company'), async (req, res) => {
  try {
    const { companyName, companyAddress, gstNumber } = req.body;

    // Check if company profile exists
    let companyDetail = await CompanyDetail.findOne({ userId: req.user.id });

    const profileData = {
      userId: req.user.id,
      companyName,
      companyAddress,
      gstNumber
    };

    if (companyDetail) {
      // Update existing
      Object.assign(companyDetail, profileData);
      await companyDetail.save();
    } else {
      // Create new
      companyDetail = new CompanyDetail(profileData);
      await companyDetail.save();
    }

    res.json({
      success: true,
      data: companyDetail
    });
  } catch (error) {
    console.error('Company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving company profile',
      error: error.message
    });
  }
});

// @route   GET /api/profiles/company
// @desc    Get current company's profile
// @access  Private (Company only)
router.get('/company', authenticate, requireRole('company'), async (req, res) => {
  try {
    const companyDetail = await CompanyDetail.findOne({ userId: req.user.id });

    if (!companyDetail) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    res.json({
      success: true,
      data: companyDetail
    });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company profile',
      error: error.message
    });
  }
});

// @route   GET /api/profiles/farmer/:id
// @desc    Get farmer profile by ID (public view)
// @access  Private
router.get('/farmer/:id', authenticate, async (req, res) => {
  try {
    const farmerDetail = await FarmerDetail.findOne({ userId: req.params.id })
      .populate('userId', 'fullName phone email');

    if (!farmerDetail) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found'
      });
    }

    // Hide sensitive information
    const publicProfile = {
      farmName: farmerDetail.farmName,
      farmLocation: farmerDetail.farmLocation,
      farmSize: farmerDetail.farmSize,
      certifications: farmerDetail.certifications,
      primaryCrop: farmerDetail.primaryCrop,
      userId: farmerDetail.userId ? {
        fullName: farmerDetail.userId.fullName
      } : null
    };

    res.json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    console.error('Get farmer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmer profile',
      error: error.message
    });
  }
});

module.exports = router;

