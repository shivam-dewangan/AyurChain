const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const FarmerDetail = require('../models/FarmerDetail');
const Batch = require('../models/Batch');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Notification = require('../models/Notification');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalFarmers,
      pendingFarmers,
      totalBatches,
      pendingBatches,
      totalPurchases,
      recentPurchases
    ] = await Promise.all([
      FarmerDetail.countDocuments(),
      FarmerDetail.countDocuments({ approvalStatus: 'pending' }),
      Batch.countDocuments(),
      // Batches waiting for admin approval (ready_for_sale with pending status)
      Batch.countDocuments({ 
        status: 'ready_for_sale',
        adminApprovalStatus: 'pending'
      }),
      Purchase.countDocuments(),
      Purchase.find().sort({ createdAt: -1 }).limit(5).populate('batchId', 'herbName')
    ]);

    const approvedFarmers = await FarmerDetail.countDocuments({ approvalStatus: 'approved' });
    const readyBatches = await Batch.countDocuments({ status: 'approved_for_sale', adminApprovalStatus: 'approved' });
    const soldBatches = await Batch.countDocuments({ status: 'sold' });

    // Calculate total revenue
    const purchases = await Purchase.find({ paymentStatus: 'completed' });
    const totalRevenue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const farmerEarnings = purchases.reduce((sum, p) => sum + p.farmerAmount, 0);

    res.json({
      success: true,
      data: {
        farmers: {
          total: totalFarmers,
          pending: pendingFarmers,
          approved: approvedFarmers
        },
        batches: {
          total: totalBatches,
          pending: pendingBatches,
          readyForSale: readyBatches,
          sold: soldBatches
        },
        purchases: {
          total: totalPurchases,
          recent: recentPurchases,
          totalRevenue,
          farmerEarnings
        }
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/farmers/pending
// @desc    Get all pending farmers
// @access  Private (Admin only)
router.get('/farmers/pending', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const farmers = await FarmerDetail.find({ approvalStatus: 'pending' })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: farmers
    });
  } catch (error) {
    console.error('Get pending farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
});

// @route   GET /api/admin/farmers
// @desc    Get all farmers
// @access  Private (Admin only)
router.get('/farmers', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.approvalStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const farmers = await FarmerDetail.find(query)
      .populate('userId', 'fullName email phone createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FarmerDetail.countDocuments(query);

    res.json({
      success: true,
      data: farmers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/farmers/:id/approve
// @desc    Approve a farmer
// @access  Private (Admin only)
router.patch('/farmers/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Validate farmer ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer ID'
      });
    }

    const farmer = await FarmerDetail.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Check if already approved
    if (farmer.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Farmer is already approved'
      });
    }

    farmer.approvalStatus = 'approved';
    farmer.approvedAt = new Date();
    farmer.approvedBy = req.user.id;
    await farmer.save();

    // Create notification for farmer
    await Notification.create({
      userId: farmer.userId,
      title: 'Registration Approved!',
      message: 'Your farmer registration has been approved. You can now create and manage batches.',
      type: 'approval_received',
      relatedId: farmer._id,
      relatedModel: 'FarmerDetail'
    });

    res.json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Approve farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving farmer',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/farmers/:id/reject
// @desc    Reject a farmer
// @access  Private (Admin only)
router.patch('/farmers/:id/reject', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Validate farmer ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid farmer ID'
      });
    }

    const { reason } = req.body;

    const farmer = await FarmerDetail.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    farmer.approvalStatus = 'rejected';
    await farmer.save();

    // Create notification for farmer
    await Notification.create({
      userId: farmer.userId,
      title: 'Registration Rejected',
      message: reason || 'Your farmer registration has been rejected. Please update your details and resubmit.',
      type: 'approval_rejected',
      relatedId: farmer._id,
      relatedModel: 'FarmerDetail'
    });

    res.json({
      success: true,
      data: farmer
    });
  } catch (error) {
    console.error('Reject farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting farmer',
      error: error.message
    });
  }
});

// @route   GET /api/admin/batches/pending
// @desc    Get all batches pending admin approval (ready_for_sale status)
// @access  Private (Admin only)
router.get('/batches/pending', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Get batches that are marked as ready_for_sale and pending admin approval
    const batches = await Batch.find({ 
      status: 'ready_for_sale',
      adminApprovalStatus: 'pending'
    })
      .populate('farmerId', 'fullName phone')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Get pending batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
});

// @route   GET /api/admin/batches/approved
// @desc    Get all approved batches (available for company purchase)
// @access  Private (Admin only)
router.get('/batches/approved', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const batches = await Batch.find({ 
      status: 'approved_for_sale',
      adminApprovalStatus: 'approved'
    })
      .populate('farmerId', 'fullName phone')
      .sort({ approvedByAdminAt: -1 });

    res.json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Get approved batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/batches/:id/approve
// @desc    Approve a batch for sale (after farmer marks it ready_for_sale)
// @access  Private (Admin only)
router.patch('/batches/:id/approve', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch is ready for sale
    if (batch.status !== 'ready_for_sale') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not ready for sale. Farmer must mark it as ready_for_sale first.'
      });
    }

    // Update to approved_for_sale status
    batch.status = 'approved_for_sale';
    batch.adminApprovalStatus = 'approved';
    batch.adminApprovalNotes = req.body.notes || 'Approved by admin';
    batch.approvedByAdminAt = new Date();
    batch.showOnCompanyDashboard = true;
    batch.qrCodeData = batch.batchNumber;
    await batch.save();

    // Record status change
    const BatchChange = require('../models/BatchChange');
    await BatchChange.create({
      batchId: batch._id,
      fieldName: 'status',
      oldValue: 'ready_for_sale',
      newValue: 'approved_for_sale',
      changedBy: req.user.id,
      notes: req.body.notes || 'Approved by admin'
    });

    // Create notification for farmer
    await Notification.create({
      userId: batch.farmerId,
      title: 'Batch Approved for Sale! 🎉',
      message: `Your batch ${batch.batchNumber} (${batch.herbName}) has been approved and is now visible to companies for purchase.`,
      type: 'batch_approved',
      relatedId: batch._id,
      relatedModel: 'Batch'
    });

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Approve batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving batch',
      error: error.message
    });
  }
});

// @route   PATCH /api/admin/batches/:id/reject
// @desc    Reject a batch (send back to farmer for improvements)
// @access  Private (Admin only)
router.patch('/batches/:id/reject', authenticate, requireRole('admin'), async (req, res) => {
  try {
    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    const { reason, notes } = req.body;

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if batch is ready for sale
    if (batch.status !== 'ready_for_sale') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not in ready_for_sale status'
      });
    }

    // Set back to drying status with rejection notes
    batch.status = 'drying';
    batch.adminApprovalStatus = 'rejected';
    batch.adminApprovalNotes = notes || reason || 'Needs improvement';
    await batch.save();

    // Record status change
    const BatchChange = require('../models/BatchChange');
    await BatchChange.create({
      batchId: batch._id,
      fieldName: 'status',
      oldValue: 'ready_for_sale',
      newValue: 'drying',
      changedBy: req.user.id,
      notes: notes || reason || 'Rejected by admin - needs improvement'
    });

    // Create notification for farmer
    await Notification.create({
      userId: batch.farmerId,
      title: 'Batch Needs Improvement 🔧',
      message: `Your batch ${batch.batchNumber} needs some improvements: ${notes || reason || 'Please review and update.'}`,
      type: 'batch_rejected',
      relatedId: batch._id,
      relatedModel: 'Batch'
    });

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Reject batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting batch',
      error: error.message
    });
  }
});

// @route   GET /api/admin/purchases
// @desc    Get all purchases
// @access  Private (Admin only)
router.get('/purchases', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await Purchase.find()
      .populate('batchId', 'herbName batchNumber')
      .populate('companyId', 'fullName')
      .populate('farmerId', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments();

    res.json({
      success: true,
      data: purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
});

module.exports = router;

