const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    unique: true,
    trim: true
    // Note: required validation handled in pre-save hook
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  herbName: {
    type: String,
    required: [true, 'Herb name is required'],
    trim: true
  },
  harvestDate: {
    type: Date,
    required: [true, 'Harvest date is required']
  },
  quantityKg: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 kg']
  },
  availableQuantityKg: {
    type: Number,
    default: function() { return this.quantityKg; }
  },
  soldQuantityKg: {
    type: Number,
    default: 0
  },
  pricePerKg: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  farmingConditions: {
    type: String,
    trim: true
  },
  moistureLevel: {
    type: Number,
    min: [0, 'Moisture level cannot be negative'],
    max: [100, 'Moisture level cannot exceed 100%']
  },
  purityReportUrl: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  qrCodeData: {
    type: String,
    trim: true
  },
  blockchainTxHash: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'pending_approval',
      'approved_by_admin',
      'approved',
      'harvested',
      'processing',
      'cleaning',
      'drying',
      'ready_for_sale',
      'available_for_purchase',
      'sold',
      'packaging',
      'shipped',
      'delivered'
    ],
    default: 'pending_approval'
  },
  showOnCompanyDashboard: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate batch number before saving
batchSchema.pre('save', async function(next) {
  if (!this.batchNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find existing batch numbers with same date prefix
    const prefix = `BATCH-${year}${month}${day}`;
    const existingCount = await mongoose.model('Batch').countDocuments({
      batchNumber: { $regex: `^${prefix}` }
    });
    
    this.batchNumber = `${prefix}-${String(existingCount + 1).padStart(3, '0')}`;
  }
  
  // Final validation to ensure batchNumber exists
  if (!this.batchNumber) {
    return next(new Error('Batch number is required'));
  }
  
  next();
});

// Indexes
batchSchema.index({ farmerId: 1 });
batchSchema.index({ status: 1 });
batchSchema.index({ herbName: 'text', batchNumber: 'text' });

module.exports = mongoose.model('Batch', batchSchema);

