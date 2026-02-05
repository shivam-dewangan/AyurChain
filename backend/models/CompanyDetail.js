const mongoose = require('mongoose');

const companyDetailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  companyAddress: {
    type: String,
    required: [true, 'Company address is required'],
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyDetail', companyDetailSchema);

