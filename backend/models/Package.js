import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  dimensions: {
    width: Number,
    height: Number,
    length: Number
  },
  weight: Number,
  contents: String,
  status: { 
    type: String, 
    enum: [
      'Ready to Send', 
      'Pending Invoice Review', 
      'Invoice Approved', 
      'Needs Review', 
      'Ship Requested', 
      'Shipped', 
      'Ready for Pickup', 
      'Delivered'
    ],
    default: 'Ready to Send'
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateReceived: { type: Date, default: Date.now },
  invoice: {
    filePath: String,
    uploadDate: Date,
    adminNotes: String
  }
}, { timestamps: true });

export default mongoose.model('Package', packageSchema);
