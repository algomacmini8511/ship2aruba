import mongoose from 'mongoose';

const shipRequestSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  dateSubmitted: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Ship Requested', 'Shipped'], 
    default: 'Ship Requested' 
  }
}, { timestamps: true });

export default mongoose.model('ShipRequest', shipRequestSchema);
