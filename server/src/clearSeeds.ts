import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { Resource } from './models/Resource.js';

const clearSeededResources = async () => {
  try {
    await connectDB();
    console.log('Connecting to database to clear seeded sample resources...');

    const result = await Resource.deleteMany({
      $or: [
        { publicId: { $in: ['biodemo_photosynthesis', 'math_quadratics', 'chem_midterm_exam'] } },
        { fileUrl: { $regex: 'res.cloudinary.com/demo' } },
        { fileUrl: { $regex: 'biodemo' } },
      ],
    });

    console.log(`Successfully removed ${result.deletedCount} seeded sample resources from the database.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to clear seeded resources:', err);
    process.exit(1);
  }
};

clearSeededResources();
