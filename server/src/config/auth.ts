import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_planner';
export const mongoClient = new MongoClient(mongoUri);

export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      institution: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      subject: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
    },
  },
  trustedOrigins: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5000',
  ],
  secret: process.env.BETTER_AUTH_SECRET || 'nexus_teacher_planner_secret_key_2026',
});
