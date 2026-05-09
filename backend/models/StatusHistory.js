import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  oldStatus: String,
  newStatus: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('StatusHistory', statusHistorySchema);
