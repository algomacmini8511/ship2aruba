import express from 'express';
import ShipRequest from '../models/ShipRequest.js';
import Package from '../models/Package.js';
import StatusHistory from '../models/StatusHistory.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper for status history
const logStatus = async (packageId, oldStatus, newStatus, userId) => {
  await StatusHistory.create({
    package: packageId,
    oldStatus,
    newStatus,
    changedBy: userId
  });
};

// @desc    Create ship request
// @route   POST /api/ship-requests
// @access  Client
router.post('/', protect, async (req, res) => {
  const { packageIds } = req.body;

  if (!packageIds || packageIds.length === 0) {
    return res.status(400).json({ message: 'No packages selected' });
  }

  try {
    // Validate packages are approved
    const packages = await Package.find({ _id: { $in: packageIds }, client: req.user._id });
    
    if (packages.length !== packageIds.length) {
      return res.status(400).json({ message: 'One or more packages not found' });
    }

    const unapproved = packages.filter(p => p.status !== 'Invoice Approved' && p.status !== 'Ready to Send');
    // Note: Usually only "Invoice Approved" can be shipped, but "Ready to Send" might be allowed if no invoice required? 
    // Brief says: "If approved -> package is ready to ship."
    // "Select approved packages"
    
    const strictlyUnapproved = packages.filter(p => p.status !== 'Invoice Approved');
    if (strictlyUnapproved.length > 0) {
       return res.status(400).json({ message: 'All packages must be Invoice Approved before shipping' });
    }

    const shipRequest = await ShipRequest.create({
      client: req.user._id,
      packages: packageIds
    });
    const shipRequestId = shipRequest._id;
    
    // Atomically update all packages
    await Package.updateMany(
      { _id: { $in: packageIds } },
      { $set: { status: 'Ship Requested', shipRequest: shipRequestId } }
    );

    // Log history for each (this can be slightly delayed/async)
    for (const pkg of packages) {
      await logStatus(pkg._id, pkg.status, 'Ship Requested', req.user._id);
    }

    res.status(201).json(shipRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all ship requests
// @route   GET /api/ship-requests
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  const requests = await ShipRequest.find({})
    .populate('client', 'name email suiteNumber')
    .populate('packages')
    .sort('-createdAt')
    .limit(50);
  res.json(requests);
});

// @desc    Process ship request
// @route   PUT /api/ship-requests/:id/process
// @access  Admin
router.put('/:id/process', protect, admin, async (req, res) => {
  const request = await ShipRequest.findById(req.params.id);

  if (request) {
    const oldRequestStatus = request.status;
    request.status = 'Shipped';
    await request.save();

    // Update all packages in the request
    const packages = await Package.find({ _id: { $in: request.packages } });
    for (const pkg of packages) {
      if (pkg.status !== 'Shipped') {
        const oldStatus = pkg.status;
        pkg.status = 'Shipped';
        await pkg.save();
        await logStatus(pkg._id, oldStatus, 'Shipped', req.user._id);
      }
    }

    res.json(request);
  } else {
    res.status(404).json({ message: 'Ship request not found' });
  }
});

export default router;
