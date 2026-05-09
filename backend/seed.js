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
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 10, height: 10, length: 12 },
        weight: 5.5,
        contents: 'Electronics & Gadgets',
        status: 'Ready to Send',
        client: createdClients[0]._id
      },
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 15, height: 10, length: 15 },
        weight: 12.0,
        contents: 'Kitchenware Set',
        status: 'Pending Invoice Review',
        client: createdClients[0]._id
      },
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 8, height: 4, length: 8 },
        weight: 2.1,
        contents: 'Fashion Accessories',
        status: 'Invoice Approved',
        client: createdClients[1]._id
      },
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 20, height: 20, length: 20 },
        weight: 25.0,
        contents: 'Home Decor Items',
        status: 'Ship Requested',
        client: createdClients[1]._id
      },
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 12, height: 12, length: 12 },
        weight: 8.5,
        contents: 'Office Supplies',
        status: 'Ready to Send',
        client: createdClients[2]._id
      },
      { 
        trackingNumber: 'TRK-' + Math.random().toString(36).substring(7).toUpperCase(),
        dimensions: { width: 10, height: 5, length: 10 },
        weight: 4.2,
        contents: 'Children Toys',
        status: 'Shipped',
        client: createdClients[3]._id
      }
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
