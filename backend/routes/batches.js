const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const Batch = require('../models/Batch');
const BatchChange = require('../models/BatchChange');
const Notification = require('../models/Notification');

// Define the strict sequential status flow for farmers
const STATUS_FLOW = [
  'harvested',
  'processing',
  'cleaning',
  'drying',
  'ready_for_sale'
];

// @route   POST /api/batches
// @desc    Create a new batch (auto-approved, no admin needed)
// @access  Private (Farmer only - must have approved profile)
router.post('/', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const {
      herbName,
      harvestDate,
      quantityKg,
      farmingConditions,
      moistureLevel,
      pricePerKg,
      purityReportUrl,
      images
    } = req.body;

    // Validation
    if (!herbName || !harvestDate || !quantityKg) {
      return res.status(400).json({
        success: false,
        message: 'Please provide herb name, harvest date, and quantity'
      });
    }

    // Check if farmer has approved profile
    const FarmerDetail = require('../models/FarmerDetail');
    const farmerProfile = await FarmerDetail.findOne({ userId: req.user.id });
    
    if (!farmerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your farmer profile first'
      });
    }
    
    if (farmerProfile.approvalStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your profile is pending approval. Please wait for admin approval before creating batches.'
      });
    }

    // Create batch with initial status 'harvested'
    const batch = new Batch({
      farmerId: req.user.id,
      herbName,
      harvestDate: new Date(harvestDate),
      quantityKg: parseFloat(quantityKg),
      farmingConditions,
      moistureLevel: moistureLevel ? parseFloat(moistureLevel) : undefined,
      pricePerKg: pricePerKg ? parseFloat(pricePerKg) : undefined,
      purityReportUrl,
      images: images || [],
      status: 'harvested',
      // Add initial status history entry
      statusHistory: [{
        status: 'harvested',
        timestamp: new Date(),
        images: images || [],
        notes: `Batch created - Harvested on ${new Date(harvestDate).toLocaleDateString()}`
      }]
    });

    await batch.save();

    res.status(201).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      error: error.message
    });
  }
});

// @route   GET /api/batches
// @desc    Get all batches (with filters)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, herbName, farmerId, page = 1, limit = 20, search } = req.query;
    
    const query = {};

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (herbName) {
      query.herbName = { $regex: herbName, $options: 'i' };
    }

    if (farmerId) {
      query.farmerId = farmerId;
    }

    if (search) {
      query.$or = [
        { herbName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Different query based on user role
    if (req.user.role === 'farmer') {
      query.farmerId = req.user.id;
    } else if (req.user.role === 'company') {
      // Companies can see batches that are ready for sale or sold
      query.showOnCompanyDashboard = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build populate fields based on role - hide sensitive info from company
    let populateFields = 'fullName phone';
    if (req.user.role !== 'company') {
      populateFields += ' email farmLocation gpsLatitude gpsLongitude completeAddress phoneNumber';
    }

    const batches = await Batch.find(query)
      .populate('farmerId', populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      data: batches,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
});

// @route   GET /api/batches/:id
// @desc    Get single batch by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    // Build populate fields based on role - hide sensitive info from company
    let populateFields = 'fullName phone';
    if (req.user.role !== 'company') {
      populateFields += ' email farmLocation gpsLatitude gpsLongitude completeAddress phoneNumber';
    }

    const batch = await Batch.findById(req.params.id)
      .populate('farmerId', populateFields);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Filter out GPS from statusHistory for company users
    let batchData = batch.toJSON();
    if (req.user.role === 'company' && batchData.statusHistory) {
      batchData.statusHistory = batchData.statusHistory.map(entry => ({
        status: entry.status,
        timestamp: entry.timestamp,
        images: entry.images,
        notes: entry.notes,
        labTestReport: entry.labTestReport
        // gpsLatitude and gpsLongitude are excluded
      }));
    }

    res.json({
      success: true,
      data: batchData
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message
    });
  }
});

// @route   GET /api/batches/batch-number/:batchNumber
// @desc    Get batch by batch number (for QR verification)
// @access  Public
router.get('/batch-number/:batchNumber', async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchNumber: req.params.batchNumber })
      .populate('farmerId', 'fullName phone');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Get status timeline with user info
    const timeline = await BatchChange.find({ batchId: batch._id })
      .populate('changedBy', 'fullName role')
      .sort({ changedAt: 1 });

    res.json({
      success: true,
      data: {
        ...batch.toJSON(),
        timeline
      }
    });
  } catch (error) {
    console.error('Get batch by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batch',
      error: error.message
    });
  }
});

// @route   PUT /api/batches/:id
// @desc    Update batch details (not status)
// @access  Private (Farmer only, owner of batch) - 24 hour restriction applies
router.put('/:id', authenticate, requireRole('farmer'), async (req, res) => {
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

    // Check ownership
    if (batch.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this batch'
      });
    }

    // Check if batch is already approved for sale or sold - no editing allowed
    if (batch.status === 'approved_for_sale' || batch.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit batch after it is approved for sale'
      });
    }

    // 24-hour restriction: Check if batch was created more than 24 hours ago
    const hoursSinceCreation = (Date.now() - new Date(batch.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation >= 24) {
      // Only allow editing if last status update was more than 24 hours ago
      const lastStatusEntry = batch.statusHistory && batch.statusHistory.length > 0 
        ? batch.statusHistory[batch.statusHistory.length - 1] 
        : null;
      
      if (lastStatusEntry && lastStatusEntry.timestamp) {
        const hoursSinceLastUpdate = (Date.now() - new Date(lastStatusEntry.timestamp).getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate < 24) {
          return res.status(400).json({
            success: false,
            message: `You can only edit batch details once every 24 hours. Please wait ${Math.ceil(24 - hoursSinceLastUpdate)} hour(s) before editing.`
          });
        }
      }
    }

    const allowedUpdates = [
      'herbName', 'harvestDate', 'quantityKg', 'farmingConditions',
      'moistureLevel', 'pricePerKg', 'purityReportUrl', 'images'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(batch, updates);
    await batch.save();

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating batch',
      error: error.message
    });
  }
});

// Define the strict sequential status flow for farmers (only farmer-controlled statuses)
const FARMER_STATUS_FLOW = [
  'harvested',
  'processing',
  'cleaning',
  'drying',
  'ready_for_sale'
];

// Define the full status flow (including post-sale statuses)
const FULL_STATUS_FLOW = [
  'harvested',
  'processing',
  'cleaning',
  'drying',
  'ready_for_sale',
  'approved_for_sale',
  'sold',
  'packaging',
  'shipped',
  'delivered'
];

// @route   PATCH /api/batches/:id/status
// @desc    Update batch status (simple status change without images/GPS)
// @access  Private (Farmer for status flow, Admin for approvals)
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const oldStatus = batch.status;
    let validTransition = false;

    // Check if user is farmer
    if (req.user.role === 'farmer') {
      // Farmer can only move through farmer-controlled statuses
      const oldIndex = FARMER_STATUS_FLOW.indexOf(oldStatus);
      const newIndex = FARMER_STATUS_FLOW.indexOf(status);
      
      if (newIndex === oldIndex + 1) {
        validTransition = true;
      }
    } 
    // Check if user is admin - can approve/reject batches ready for sale
    else if (req.user.role === 'admin') {
      if (oldStatus === 'ready_for_sale' && (status === 'approved_for_sale' || status === 'drying')) {
        validTransition = true;
      }
    }
    // For sold statuses (packaging, shipped, delivered) - could be triggered by system or logistics
    else {
      const oldIndex = FULL_STATUS_FLOW.indexOf(oldStatus);
      const newIndex = FULL_STATUS_FLOW.indexOf(status);
      if (newIndex > oldIndex) {
        validTransition = true;
      }
    }

    if (!validTransition) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${oldStatus.replace(/_/g, ' ')}" to "${status.replace(/_/g, ' ')}"`
      });
    }

    // Record status change in BatchChange
    await BatchChange.create({
      batchId: batch._id,
      fieldName: 'status',
      oldValue: oldStatus,
      newValue: status,
      changedBy: req.user.id
    });

    batch.status = status;
    
    // Set showOnCompanyDashboard to true when batch is approved for sale
    if (status === 'approved_for_sale') {
      batch.showOnCompanyDashboard = true;
      batch.adminApprovalStatus = 'approved';
      batch.approvedByAdminAt = new Date();
    }
    
    // Handle rejection - reset to drying for rework
    if (status === 'drying' && req.user.role === 'admin') {
      batch.adminApprovalStatus = 'rejected';
      batch.adminApprovalNotes = req.body.notes || 'Needs improvement';
    }
    
    // Handle sold status
    if (status === 'sold') {
      batch.availableQuantityKg = 0;
    }

    await batch.save();

    // Notify farmer of status change
    await Notification.create({
      userId: batch.farmerId,
      title: 'Batch Status Updated',
      message: `Your batch ${batch.batchNumber} status changed to ${status.replace(/_/g, ' ')}`,
      type: 'batch_status_changed',
      relatedId: batch._id,
      relatedModel: 'Batch'
    });

    // Notify admin when batch is ready for sale
    if (status === 'ready_for_sale') {
      batch.adminApprovalStatus = 'pending';
      await batch.save();
      
      // Find admin users and notify them
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          title: 'Batch Ready for Review',
          message: `Batch ${batch.batchNumber} (${batch.herbName}) is ready for sale and needs admin approval`,
          type: 'batch_created',
          relatedId: batch._id,
          relatedModel: 'Batch'
        });
      }
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// @route   PATCH /api/batches/:id/status-update
// @desc    Update batch status with images, GPS, and notes
// @access  Private (Farmer only)
router.patch('/:id/status-update', authenticate, requireRole('farmer'), async (req, res) => {
  try {
    const { status, images, gpsLatitude, gpsLongitude, notes, labTestReport } = req.body;

    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check ownership
    if (batch.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this batch'
      });
    }

    // Check if batch is already approved for sale - no more updates allowed
    if (batch.status === 'approved_for_sale' || batch.status === 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status once batch is approved for sale or sold'
      });
    }

    const oldStatus = batch.status;
    const oldIndex = FARMER_STATUS_FLOW.indexOf(oldStatus);
    const newIndex = FARMER_STATUS_FLOW.indexOf(status);

    // Validate status flow - must be sequential
    if (newIndex !== oldIndex + 1) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition. Current status is "${oldStatus.replace(/_/g, ' ')}". Next status must be "${FARMER_STATUS_FLOW[oldIndex + 1]?.replace(/_/g, ' ')}"`
      });
    }

    // Create status history entry
    const statusHistoryEntry = {
      status: status,
      timestamp: new Date(),
      images: images || [],
      notes: notes || '',
      labTestReport: labTestReport || ''
    };

    // Add GPS if provided
    if (gpsLatitude !== undefined) statusHistoryEntry.gpsLatitude = gpsLatitude;
    if (gpsLongitude !== undefined) statusHistoryEntry.gpsLongitude = gpsLongitude;

    // Add to status history array
    batch.statusHistory.push(statusHistoryEntry);

    // Update main status
    batch.status = status;
    
    // If moving to ready_for_sale, set admin approval to pending
    if (status === 'ready_for_sale') {
      batch.adminApprovalStatus = 'pending';
    }

    await batch.save();

    // Record status change in BatchChange
    await BatchChange.create({
      batchId: batch._id,
      fieldName: 'status',
      oldValue: oldStatus,
      newValue: status,
      changedBy: req.user.id,
      notes: notes
    });

    // Notify admin when batch is ready for sale
    if (status === 'ready_for_sale') {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          title: 'Batch Ready for Review',
          message: `Batch ${batch.batchNumber} (${batch.herbName}) is ready for sale and needs admin approval`,
          type: 'batch_created',
          relatedId: batch._id,
          relatedModel: 'Batch'
        });
      }
    }

    res.json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

// @route   DELETE /api/batches/:id
// @desc    Delete batch
// @access  Private (Farmer only, owner of batch)
router.delete('/:id', authenticate, requireRole('farmer'), async (req, res) => {
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

    // Check ownership
    if (batch.farmerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this batch'
      });
    }

    // Only block deletion if batch has been sold
    const nonDeletableStatuses = [
      'sold',
      'packaging',
      'shipped',
      'delivered'
    ];

    if (nonDeletableStatuses.includes(batch.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete batch after it has been sold'
      });
    }

    await Batch.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting batch',
      error: error.message
    });
  }
});

// @route   GET /api/batches/:id/timeline
// @desc    Get batch status timeline
// @access  Private
router.get('/:id/timeline', authenticate, async (req, res) => {
  try {
    // Validate batch ID
    if (!req.params.id || req.params.id === 'undefined' || req.params.id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Invalid batch ID'
      });
    }

    const timeline = await BatchChange.find({ batchId: req.params.id })
      .populate('changedBy', 'fullName role')
      .sort({ changedAt: 1 });

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timeline',
      error: error.message
    });
  }
});

module.exports = router;

