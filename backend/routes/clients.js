import express from 'express';
import User from '../models/User.js';
import Package from '../models/Package.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all clients
// @route   GET /api/clients
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  const clients = await User.find({ role: 'client' }).select('-password');
  
  // Attach package counts for each client
  const clientsWithCounts = await Promise.all(clients.map(async (client) => {
    const packageCount = await Package.countDocuments({ client: client._id });
    return {
      ...client.toObject(),
      packageCount
    };
  }));

  res.json(clientsWithCounts);
});

// @desc    Get dashboard stats
// @route   GET /api/clients/stats
// @access  Admin
router.get('/stats', protect, admin, async (req, res) => {
  const totalPackages = await Package.countDocuments();
  const totalClients = await User.countDocuments({ role: 'client' });
  const pendingInvoices = await Package.countDocuments({ status: 'Pending Invoice Review' });
  
  const statusCounts = await Package.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({
    totalPackages,
    totalClients,
    pendingInvoices,
    statusCounts
  });
});

export default router;
