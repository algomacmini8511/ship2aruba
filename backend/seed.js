import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Package from './models/Package.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (optional, but good for a clean seed)
    // await User.deleteMany({ role: 'client' });
    // await Package.deleteMany({});

    const clients = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'client', suiteNumber: 'S2A-1001' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'client', suiteNumber: 'S2A-1002' },
      { name: 'Mike Ross', email: 'mike@example.com', password: 'password123', role: 'client', suiteNumber: 'S2A-1003' },
      { name: 'Rachel Zane', email: 'rachel@example.com', password: 'password123', role: 'client', suiteNumber: 'S2A-1004' }
    ];

    const createdClients = [];
    for (const client of clients) {
      const existing = await User.findOne({ email: client.email });
      if (!existing) {
        const newUser = await User.create(client);
        createdClients.push(newUser);
        console.log(`Created client: ${client.name}`);
      } else {
        createdClients.push(existing);
        console.log(`Client already exists: ${client.name}`);
      }
    }

    const packages = [
      // Ready to Send
      { trackingNumber: 'TRK-NEW101', dimensions: { width: 10, height: 10, length: 10 }, weight: 5.0, contents: 'Electronics', status: 'Ready to Send', client: createdClients[0]._id },
      { trackingNumber: 'TRK-NEW102', dimensions: { width: 12, height: 8, length: 12 }, weight: 3.5, contents: 'Clothing', status: 'Ready to Send', client: createdClients[1]._id },
      { trackingNumber: 'TRK-NEW103', dimensions: { width: 15, height: 15, length: 15 }, weight: 10.0, contents: 'Kitchenware', status: 'Ready to Send', client: createdClients[2]._id },

      // Pending Invoice Review
      { trackingNumber: 'TRK-REV201', dimensions: { width: 5, height: 5, length: 5 }, weight: 1.2, contents: 'Books', status: 'Pending Invoice Review', client: createdClients[0]._id },
      { trackingNumber: 'TRK-REV202', dimensions: { width: 20, height: 10, length: 20 }, weight: 15.0, contents: 'Furniture part', status: 'Pending Invoice Review', client: createdClients[3]._id },

      // Needs Review (Rejected)
      { trackingNumber: 'TRK-FIX301', dimensions: { width: 8, height: 4, length: 8 }, weight: 2.5, contents: 'Cosmetics', status: 'Needs Review', client: createdClients[1]._id, invoice: { adminNotes: 'Invoice is blurry, please re-upload.' } },
      { trackingNumber: 'TRK-FIX302', dimensions: { width: 10, height: 10, length: 5 }, weight: 4.0, contents: 'Tools', status: 'Needs Review', client: createdClients[2]._id, invoice: { adminNotes: 'Price mismatch on bill.' } },

      // Invoice Approved
      { trackingNumber: 'TRK-APP401', dimensions: { width: 12, height: 12, length: 12 }, weight: 6.8, contents: 'Sports Gear', status: 'Invoice Approved', client: createdClients[0]._id },
      { trackingNumber: 'TRK-APP402', dimensions: { width: 14, height: 10, length: 14 }, weight: 9.0, contents: 'Home Decor', status: 'Invoice Approved', client: createdClients[1]._id },
      { trackingNumber: 'TRK-APP403', dimensions: { width: 6, height: 6, length: 6 }, weight: 2.0, contents: 'Jewelry', status: 'Invoice Approved', client: createdClients[0]._id },

      // Ship Requested
      { trackingNumber: 'TRK-REQ501', dimensions: { width: 25, height: 15, length: 25 }, weight: 35.0, contents: 'Monitor', status: 'Ship Requested', client: createdClients[2]._id },
      { trackingNumber: 'TRK-REQ502', dimensions: { width: 10, height: 5, length: 10 }, weight: 3.0, contents: 'Cables', status: 'Ship Requested', client: createdClients[2]._id },

      // Shipped (In Transit)
      { trackingNumber: 'TRK-SHP601', dimensions: { width: 15, height: 10, length: 15 }, weight: 12.5, contents: 'Coffee Machine', status: 'Shipped', client: createdClients[3]._id },
      { trackingNumber: 'TRK-SHP602', dimensions: { width: 8, height: 8, length: 8 }, weight: 4.5, contents: 'Gifts', status: 'Shipped', client: createdClients[3]._id },

      // Ready for Pickup (Arrived)
      { trackingNumber: 'TRK-PKP701', dimensions: { width: 12, height: 6, length: 12 }, weight: 7.2, contents: 'Auto Parts', status: 'Ready for Pickup', client: createdClients[0]._id },
      { trackingNumber: 'TRK-PKP702', dimensions: { width: 10, height: 10, length: 10 }, weight: 5.5, contents: 'Stationery', status: 'Ready for Pickup', client: createdClients[0]._id },

      // Delivered
      { trackingNumber: 'TRK-DLV801', dimensions: { width: 5, height: 5, length: 5 }, weight: 1.0, contents: 'Vitamins', status: 'Delivered', client: createdClients[1]._id },
      { trackingNumber: 'TRK-DLV802', dimensions: { width: 20, height: 20, length: 20 }, weight: 22.0, contents: 'Mattress', status: 'Delivered', client: createdClients[2]._id }
    ];

    for (const pkg of packages) {
      const existing = await Package.findOne({ trackingNumber: pkg.trackingNumber });
      if (!existing) {
        await Package.create(pkg);
        console.log(`Created package: ${pkg.trackingNumber}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
