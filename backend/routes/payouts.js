const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const Payout = require('../models/Payout');
const Purchase = require('../models/Purchase');
const FarmerDetail = require('../models/FarmerDetail');
const Notification = require('../models/Notification');

// ============== ADMIN ROUTES (must be before general routes) ==============

// @route   GET /api/payouts/admin/all
// @desc    Get all payouts (for admin)
// @access  Private (Admin only)
router.get('/admin/all', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payouts = await Payout.find(query)
      .populate('farmerId', 'fullName email phone')
      .populate('purchaseId', 'batchId quantityKg totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payout.countDocuments(query);

    // Calculate stats
    const allPayouts = await Payout.find().lean();
    const stats = {
      total: allPayouts.length,
      pending: allPayouts.filter(p => p.status === 'pending').length,
      processing: allPayouts.filter(p => p.status === 'processing').length,
      completed: allPayouts.filter(p => p.status === 'completed').length,
      failed: allPayouts.filter(p => p.status === 'failed').length,
      totalAmount: allPayouts.reduce((sum, p) => sum + p.amount, 0)
    };

    res.json({
      success: true,
      data: payouts,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
});

// @route   PATCH /api/payouts/admin/approve/:id
// @desc    Approve a payout request
// @access  Private (Admin only)
router.patch('/admin/approve/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout is not in pending status'
      });
    }

    // Update payout status
    payout.status = 'processing';
    payout.notes = req.body.notes || 'Approved by admin';
    await payout.save();

    // Notify farmer
    await Notification.create({
      userId: payout.farmerId,
      title: 'Payout Approved',
      message: `Your payout request of ₹${payout.amount} has been approved and is being processed.`,
      type: 'payout_approved',
      relatedId: payout._id,
      relatedModel: 'Payout'
    });

    res.json({
      success: true,
      data: payout,
      message: 'Payout approved successfully'
    });
  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving payout',
      error: error.message
    });
  }
});

// @route   PATCH /api/payouts/admin/complete/:id
// @desc    Mark payout as completed (after payment is made)
// @access  Private (Admin only)
router.patch('/admin/complete/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'processing' && payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payout cannot be completed in current status'
      });
    }

    // Update payout status
    payout.status = 'completed';
    payout.transactionId = req.body.transactionId || `TXN-${Date.now()}`;
    payout.transactionDate = new Date();
    payout.notes = req.body.notes || 'Payment completed by admin';
    await payout.save();

    // Notify farmer
    await Notification.create({
      userId: payout.farmerId,
      title: 'Payout Completed! 🎉',
      message: `Your payout of ₹${payout.amount} has been completed. Transaction ID: ${payout.transactionId}`,
      type: 'payout_completed',
      relatedId: payout._id,
      relatedModel: 'Payout'
    });

    res.json({
      success: true,
      data: payout,
      message: 'Payout completed successfully'
    });
  } catch (error) {
    console.error('Complete payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing payout',
      error: error.message
    });
  }
});

// @route   PATCH /api/payouts/admin/reject/:id
// @desc    Reject a payout request
// @access  Private (Admin only)
router.patch('/admin/reject/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    if (payout.status !== 'pending' && payout.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Payout cannot be rejected in current status'
      });
    }

    // Update payout status
    payout.status = 'cancelled';
    payout.failureReason = req.body.reason || 'Rejected by admin';
    payout.notes = req.body.notes || '';
    await payout.save();

    // Notify farmer
    await Notification.create({
      userId: payout.farmerId,
      title: 'Payout Rejected',
      message: `Your payout request of ₹${payout.amount} has been rejected. Reason: ${payout.failureReason}`,
      type: 'payout_rejected',
      relatedId: payout._id,
      relatedModel: 'Payout'
    });

    res.json({
      success: true,
      data: payout,
      message: 'Payout rejected successfully'
    });
  } catch (error) {
    console.error('Reject payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payout',
      error: error.message
    });
  }
});

// ============== FARMER ROUTES ==============

// @route   POST /api/payouts
// @desc    Request payout for available balance
// @access  Private (Farmer only)
router.post('/', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    console.log('=== PAYOUT REQUEST DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('User Role:', req.user.role);
    console.log('Amount:', amount);
    console.log('Payment Method:', paymentMethod);
    console.log('===========================');

    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid amount'
      });
    }

    // Get farmer profile for payment details
    console.log('Looking for farmer profile with userId:', req.user.id);
    const farmerProfile = await FarmerDetail.findOne({ userId: req.user.id });
    
    console.log('Farmer profile found:', farmerProfile ? 'YES' : 'NO');
    if (farmerProfile) {
      console.log('Payment method in profile:', farmerProfile.preferredPaymentMethod);
      console.log('Bank details:', {
        hasBankAccount: !!farmerProfile.bankAccountNumber,
        bankName: farmerProfile.bankName,
        hasUPI: !!farmerProfile.upiId
      });
    }
    
    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your farmer profile first'
      });
    }

    // Use payment method from request, or fallback to profile
    const method = paymentMethod || farmerProfile.preferredPaymentMethod;
    
    console.log('Final payment method to use:', method);
    
    if (!method || method === 'none') {
      return res.status(400).json({
        success: false,
        message: 'Please set up payment method in your profile'
      });
    }

    // Get available balance
    console.log('Fetching purchases for farmerId:', req.user.id);
    const purchases = await Purchase.find({ 
      farmerId: req.user.id,
      paymentStatus: 'completed'
    }).lean();
    
    console.log('Found purchases:', purchases.length);
    
    const totalEarnings = purchases.reduce((sum, p) => sum + (p.farmerAmount || 0), 0);
    console.log('Total earnings from purchases:', totalEarnings);
    
    const allPayouts = await Payout.find({ farmerId: req.user.id }).lean();
    console.log('Found existing payouts:', allPayouts.length);
    
    const completedPayouts = allPayouts.filter(p => p.status === 'completed');
    const pendingPayouts = allPayouts.filter(p => p.status === 'pending' || p.status === 'processing');
    
    const totalPaid = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const availableForPayout = totalEarnings - totalPaid - totalPending;
    
    console.log('Available for payout calculation:', {
      totalEarnings,
      totalPaid,
      totalPending,
      availableForPayout,
      requestedAmount: payoutAmount
    });

    if (payoutAmount > availableForPayout) {
      return res.status(400).json({
        success: false,
        message: `Insufficient available balance. Available: ₹${availableForPayout.toFixed(2)}`
      });
    }

    // Prepare payout details based on payment method
    const payoutData = {
      farmerId: req.user.id,
      amount: payoutAmount,
      paymentMethod: method
    };

    if (method === 'bank_transfer') {
      if (!farmerProfile.bankAccountNumber || !farmerProfile.bankName) {
        return res.status(400).json({
          success: false,
          message: 'Please update your bank account details in your profile'
        });
      }
      payoutData.bankAccountHolderName = farmerProfile.bankAccountHolderName;
      payoutData.bankAccountNumber = farmerProfile.bankAccountNumber;
      payoutData.bankName = farmerProfile.bankName;
      payoutData.bankIFSCCode = farmerProfile.bankIFSCCode;
    } else if (method === 'upi') {
      if (!farmerProfile.upiId) {
        return res.status(400).json({
          success: false,
          message: 'Please update your UPI ID in your profile'
        });
      }
      payoutData.upiId = farmerProfile.upiId;
    }

    console.log('Creating payout with data:', payoutData);
    
    // Create payout - Auto-approve: set status to completed
    const payout = new Payout({
      ...payoutData,
      status: 'completed',
      transactionId: `TXN-${Date.now()}`,
      transactionDate: new Date(),
      notes: 'Auto-completed on request'
    });
    await payout.save();

    console.log('Payout created successfully:', payout._id);

    // Notify admin (optional - don't fail if this fails)
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' }).lean();
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          title: 'New Payout Request',
          message: `Farmer requested a payout of ₹${payoutAmount}`,
          type: 'payout_request',
          relatedId: payout._id,
          relatedModel: 'Payout'
        });
      }
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
    }

    res.status(201).json({
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('=== CREATE PAYOUT ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('===========================');
    res.status(500).json({
      success: false,
      message: 'Error creating payout request: ' + error.message,
      error: error.message
    });
  }
});

// @route   GET /api/payouts
// @desc    Get payouts for current farmer
// @access  Private (Farmer only)
router.get('/', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = { farmerId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get payouts with optional populate (only if purchaseId exists)
    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Manually populate purchaseId only for payouts that have it
    for (const payout of payouts) {
      if (payout.purchaseId) {
        try {
          const purchase = await Purchase.findById(payout.purchaseId).select('batchId quantityKg totalAmount').lean();
          if (purchase) {
            payout.purchaseId = purchase;
          }
        } catch (e) {
          // Ignore populate errors
        }
      }
    }

    const total = await Payout.countDocuments(query);

    // Calculate earnings
    const allPayouts = await Payout.find({ farmerId: req.user.id }).lean();
    const totalEarnings = allPayouts.reduce((sum, p) => sum + p.amount, 0);
    const completedEarnings = allPayouts
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingEarnings = allPayouts
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: payouts,
      earnings: {
        total: totalEarnings,
        completed: completedEarnings,
        pending: pendingEarnings
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
      error: error.message
    });
  }
});

// @route   GET /api/payouts/stats
// @desc    Get payout stats for farmer
// @access  Private (Farmer only)
router.get('/stats', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    // Get all purchases for this farmer
    const purchases = await Purchase.find({ 
      farmerId: req.user.id,
      paymentStatus: 'completed'
    }).lean();

    // Calculate total earnings from purchases (farmerAmount)
    const totalEarnings = purchases.reduce((sum, p) => sum + (p.farmerAmount || 0), 0);

    // Get all payouts
    const allPayouts = await Payout.find({ farmerId: req.user.id }).lean();
    
    const completedPayouts = allPayouts.filter(p => p.status === 'completed');
    const pendingPayouts = allPayouts.filter(p => p.status === 'pending' || p.status === 'processing');

    const totalPaid = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const availableForPayout = totalEarnings - totalPaid - totalPending;

    res.json({
      success: true,
      data: {
        totalEarnings: totalEarnings || 0,
        totalPaid: totalPaid || 0,
        totalPending: totalPending || 0,
        availableForPayout: Math.max(0, availableForPayout) || 0,
        completedCount: completedPayouts.length || 0,
        pendingCount: pendingPayouts.length || 0
      }
    });
  } catch (error) {
    console.error('Get payout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout stats',
      error: error.message
    });
  }
});

// @route   GET /api/payouts/:id
// @desc    Get single payout
// @access  Private (Farmer or Admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('purchaseId');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && payout.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payout'
      });
    }

    res.json({
      success: true,
      data: payout
    });
  } catch (error) {
    console.error('Get payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout',
      error: error.message
    });
  }
});

module.exports = router;

