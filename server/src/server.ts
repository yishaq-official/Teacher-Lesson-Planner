import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { toNodeHandler } from 'better-auth/node';
import { connectDB } from './config/db.js';
import { auth } from './config/auth.js';
import './models/User.js';
import { Resource } from './models/Resource.js';

import lessonRoutes from './routes/lessonRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration allowing Vercel deployment & configured origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://edushelf-blond.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Better Auth endpoint handler (Must be placed before express.json() if handling raw requests)
app.all('/api/auth/*path', toNodeHandler(auth));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Local Uploads with CORS & Inline View Headers
app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  })
);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Teacher Lesson Planner API',
    timestamp: new Date().toISOString(),
  });
});

// Protected API Routes
app.use('/api/lessons', lessonRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/user', userRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();
  try {
    // Ensure all uploaded resources are set to public so they appear on the Community Resource Hub
    await Resource.updateMany({ $or: [{ isPublic: false }, { isPublic: { $exists: false } }] }, { $set: { isPublic: true } });
  } catch (e) {
    console.error('[Resource Migration Warning]:', e);
  }
  app.listen(PORT, () => {
    console.log(`[Server] Teacher Lesson Planner Server running on http://localhost:${PORT}`);
  });
};

startServer();
