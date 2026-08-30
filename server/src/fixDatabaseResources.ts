import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { Resource } from './models/Resource.js';
import { User } from './models/User.js';
import { mongoClient } from './config/auth.js';

const fixDatabase = async () => {
  try {
    await connectDB();
    console.log('Connecting to database to fix file URLs & sync User profiles...');

    const db = mongoClient.db();
    const authUsers = await db.collection('user').find({}).toArray();
    console.log(`Found ${authUsers.length} users in Better-Auth user collection.`);

    for (const u of authUsers) {
      await User.findOneAndUpdate(
        { _id: u._id || u.id },
        {
          $set: {
            name: u.name || u.email?.split('@')[0] || 'Teacher User',
            email: u.email || '',
            institution: u.institution || '',
            subject: u.subject || '',
          },
        },
        { upsert: true }
      );
    }

    // Update resources that have hardcoded localhost URLs
    const resources = await Resource.find({});
    let updatedCount = 0;

    for (const r of resources) {
      let modified = false;
      let newUrl = r.fileUrl;

      if (newUrl.includes('localhost:5000/uploads/')) {
        newUrl = '/uploads/' + newUrl.split('/uploads/')[1];
        modified = true;
      } else if (newUrl.includes('127.0.0.1:5000/uploads/')) {
        newUrl = '/uploads/' + newUrl.split('/uploads/')[1];
        modified = true;
      }

      if (modified) {
        r.fileUrl = newUrl;
        await r.save();
        updatedCount++;
      }
    }

    console.log(`Successfully fixed ${updatedCount} resource file URLs!`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to fix database resources:', err);
    process.exit(1);
  }
};

fixDatabase();
