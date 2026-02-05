const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch ID is required']
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company ID is required']
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Farmer ID is required']
  },
  quantityKg: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.1, 'Quantity must be at least 0.1 kg']
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Price per kg is required']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  },
  farmerAmount: {
    type: Number,
    required: [true, 'Farmer amount is required']
  },
  platformAmount: {
    type: Number,
    required: [true, 'Platform amount is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  blockchainTxHash: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
purchaseSchema.index({ batchId: 1 });
purchaseSchema.index({ companyId: 1 });
purchaseSchema.index({ farmerId: 1 });
purchaseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);

