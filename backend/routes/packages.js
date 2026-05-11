import express from 'express';
import multer from 'multer';
import path from 'path';
import Package from '../models/Package.js';
import ShipRequest from '../models/ShipRequest.js';
import StatusHistory from '../models/StatusHistory.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images and PDFs allowed!');
    }
  },
});

// Helper for status history
const logStatus = async (packageId, oldStatus, newStatus, userId) => {
  await StatusHistory.create({
    package: packageId,
    oldStatus,
    newStatus,
    changedBy: userId
  });
};

// @desc    Create new package
// @route   POST /api/packages
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    await logStatus(pkg._id, null, pkg.status, req.user._id);
    res.status(201).json(pkg);
  } catch (error) {
    if (error.code === 11000 || (error.message && error.message.includes('E11000'))) {
      return res.status(400).json({ message: 'Package with this tracking number already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all packages
// @route   GET /api/packages
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  const packages = await Package.find({})
    .populate('client', 'name email suiteNumber')
    .populate('shipRequest')
    .sort('-createdAt');
  res.json(packages);
});

// @desc    Get client packages
// @route   GET /api/packages/my
// @access  Client
router.get('/my', protect, async (req, res) => {
  const packages = await Package.find({ client: req.user._id })
    .populate('shipRequest')
    .sort('-createdAt');
  res.json(packages);
});

// @desc    Upload invoice
// @route   PUT /api/packages/:id/invoice
// @access  Client
router.put('/:id/invoice', protect, upload.single('invoice'), async (req, res) => {
  const pkg = await Package.findById(req.id || req.params.id);
  
  if (pkg) {
    if (pkg.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const oldStatus = pkg.status;
    pkg.invoice = {
      filePath: `/uploads/${req.file.filename}`,
      uploadDate: Date.now(),
      adminNotes: pkg.invoice?.adminNotes || ''
    };
    pkg.status = 'Pending Invoice Review';
    
    const updatedPkg = await pkg.save();
    await logStatus(pkg._id, oldStatus, 'Pending Invoice Review', req.user._id);
    
    res.json(updatedPkg);
  } else {
    res.status(404).json({ message: 'Package not found' });
  }
});

// @desc    Review invoice
// @route   PUT /api/packages/:id/review
// @access  Admin
router.put('/:id/review', protect, admin, async (req, res) => {
  const { status, adminNotes } = req.body;
  const pkg = await Package.findById(req.params.id);

  if (pkg) {
    const oldStatus = pkg.status;
    pkg.status = status; // Expected 'Invoice Approved' or 'Needs Review'
    pkg.invoice.adminNotes = adminNotes;
    
    const updatedPkg = await pkg.save();
    await logStatus(pkg._id, oldStatus, status, req.user._id);
    
    res.json(updatedPkg);
  } else {
    res.status(404).json({ message: 'Package not found' });
  }
});

// @desc    Update status (Manual)
// @route   PUT /api/packages/:id/status
// @access  Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  const { status } = req.body;
  const pkg = await Package.findById(req.params.id);

  if (pkg) {
    const oldStatus = pkg.status;
    pkg.status = status;
    const updatedPkg = await pkg.save();
    await logStatus(pkg._id, oldStatus, status, req.user._id);

    // If marked as Shipped, also update any related ShipRequests
    if (status === 'Shipped') {
      const result = await ShipRequest.updateMany(
        { packages: pkg._id, status: { $ne: 'Shipped' } },
        { $set: { status: 'Shipped' } }
      );
      console.log(`Synced ${result.modifiedCount} ShipRequests to Shipped for pkg ${pkg.trackingNumber}`);
    }

    res.json(updatedPkg);
  } else {
    res.status(404).json({ message: 'Package not found' });
  }
});

export default router;
