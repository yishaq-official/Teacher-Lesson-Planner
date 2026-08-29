import mongoose, { Schema, Document } from 'mongoose';
import './User.js';

export interface IResource extends Document {
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  topic: string;
  type: 'worksheet' | 'presentation' | 'exercise' | 'exam' | 'notes' | 'other';
  tags: string[];
  fileUrl: string;
  publicId: string;
  fileType: string;
  fileSize: number;
  downloadsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    teacherId: { type: String, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    subject: { type: String, required: true, index: true },
    grade: { type: String, required: true, index: true },
    topic: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['worksheet', 'presentation', 'exercise', 'exam', 'notes', 'other'],
      default: 'worksheet',
      index: true,
    },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, default: 'application/octet-stream' },
    fileSize: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create compound text index for search
ResourceSchema.index({ title: 'text', description: 'text', topic: 'text', tags: 'text' });

export const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
