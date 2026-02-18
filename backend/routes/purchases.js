const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const Purchase = require('../models/Purchase');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');

// @route   POST /api/purchases
// @desc    Create a new purchase
// @access  Private (Company only)
router.post('/', authenticate, requireRole('company'), async (req, res) => {
  try {
    const { batchId, quantityKg } = req.body;

    // Validation
    if (!batchId || !quantityKg) {
      return res.status(400).json({
        success: false,
        message: 'Please provide batch ID and quantity'
      });
    }

    // Get batch
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check batch availability
    const availableQty = batch.availableQuantityKg !== null && batch.availableQuantityKg !== undefined 
      ? batch.availableQuantityKg 
      : batch.quantityKg;

    if (batch.status !== 'ready_for_sale' && batch.status !== 'approved_for_sale') {
      return res.status(400).json({
        success: false,
        message: 'Batch is not available for sale'
      });
    }

    if (availableQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch is sold out'
      });
    }

    const requestedQty = parseFloat(quantityKg);
    if (requestedQty > availableQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableQty} kg available for purchase`
      });
    }

    // Calculate amounts (80% to farmer, 20% platform fee)
    const totalAmount = requestedQty * (batch.pricePerKg || 0);
    const farmerAmount = totalAmount * 0.8;
    const platformAmount = totalAmount * 0.2;

    // Create purchase
    const purchase = new Purchase({
      batchId: batch._id,
      companyId: req.user.id,
      farmerId: batch.farmerId,
      quantityKg: requestedQty,
      pricePerKg: batch.pricePerKg,
      totalAmount,
      farmerAmount,
      platformAmount,
      paymentStatus: 'completed'
    });

    await purchase.save();

    // Update batch inventory
    const newAvailableQty = availableQty - requestedQty;
    const currentSoldQty = batch.soldQuantityKg || 0;
    
    batch.availableQuantityKg = newAvailableQty;
    batch.soldQuantityKg = currentSoldQty + requestedQty;
    batch.status = newAvailableQty <= 0 ? 'sold' : 'ready_for_sale';
    
    await batch.save();

    // Notify farmer
    await Notification.create({
      userId: batch.farmerId,
      title: 'New Purchase!',
      message: `Your batch ${batch.batchNumber} (${batch.herbName}) has been sold! Quantity: ${requestedQty} kg`,
      type: 'purchase_made',
      relatedId: purchase._id,
      relatedModel: 'Purchase'
    });

    res.status(201).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: error.message
    });
  }
});

// @route   GET /api/purchases
// @desc    Get purchases (filtered by role)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, batchId } = req.query;
    
    const query = {};

    // Filter by batchId if provided - return all purchases for this batch
    if (batchId) {
      query.batchId = batchId;
    }

    // Filter based on role
    if (req.user.role === 'farmer') {
      query.farmerId = req.user.id;
    } else if (req.user.role === 'company') {
      query.companyId = req.user.id;
    } else if (req.user.role === 'admin') {
      // Admin sees all
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const purchases = await Purchase.find(query)
      .populate('batchId', 'herbName batchNumber harvestDate')
      .populate('companyId', 'fullName phone email')
      .populate('farmerId', 'fullName phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Purchase.countDocuments(query);

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

// @route   GET /api/purchases/batch/:batchId
// @desc    Get purchases for a specific batch (public endpoint for verification)
// @access  Public
router.get('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // Validate batchId format
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    const purchases = await Purchase.find({ batchId })
      .populate('companyId', 'fullName phone email companyName')
      .populate('farmerId', 'fullName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get batch purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/:id
// @desc    Get single purchase
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('batchId', 'herbName batchNumber harvestDate')
      .populate('companyId', 'fullName phone')
      .populate('farmerId', 'fullName phone');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    // Check access
    if (req.user.role !== 'admin' && 
        purchase.companyId._id.toString() !== req.user.id &&
        purchase.farmerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this purchase'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Get purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/farmer/:farmerId
// @desc    Get purchases for a specific farmer
// @access  Private (Admin or owner)
router.get('/farmer/:farmerId', authenticate, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.params.farmerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these purchases'
      });
    }

    const purchases = await Purchase.find({ farmerId: req.params.farmerId })
      .populate('batchId', 'herbName batchNumber')
      .populate('companyId', 'fullName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get farmer purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
});

// @route   GET /api/purchases/company/:companyId
// @desc    Get purchases for a specific company
// @access  Private (Admin or owner)
router.get('/company/:companyId', authenticate, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.params.companyId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these purchases'
      });
    }

    const purchases = await Purchase.find({ companyId: req.params.companyId })
      .populate('batchId', 'herbName batchNumber')
      .populate('farmerId', 'fullName phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    console.error('Get company purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases',
      error: error.message
    });
  }
});

module.exports = router;

