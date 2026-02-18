const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: false  // Now optional - allows payouts from available balance
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'none'],
    default: 'none'
  },
  // Bank transfer details
  bankAccountHolderName: {
    type: String,
    trim: true
  },
  bankAccountNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  bankIFSCCode: {
    type: String,
    trim: true
  },
  // UPI details
  upiId: {
    type: String,
    trim: true
  },
  // Transaction details
  transactionId: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date
  },
  failureReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
payoutSchema.index({ farmerId: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ purchaseId: 1 });

module.exports = mongoose.model('Payout', payoutSchema);

