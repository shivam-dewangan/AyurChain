const mongoose = require('mongoose');

const batchChangeSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  fieldName: {
    type: String,
    required: true,
    enum: ['status', 'quantity', 'price', 'images', 'farming_conditions']
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'changedAt' }
});

// Indexes
batchChangeSchema.index({ batchId: 1 });
batchChangeSchema.index({ changedAt: -1 });

module.exports = mongoose.model('BatchChange', batchChangeSchema);

