import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_planner';
export const mongoClient = new MongoClient(mongoUri);

const clientOrigins = [
  process.env.CLIENT_URL,
  'https://edushelf-blond.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
].filter(Boolean) as string[];

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
  trustedOrigins: clientOrigins,
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || 'nexus_teacher_planner_secret_key_2026',
});
