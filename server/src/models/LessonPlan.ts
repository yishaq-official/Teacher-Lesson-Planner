import mongoose, { Schema, Document } from 'mongoose';
import './User.js';

export interface ILessonPlan extends Document {
  teacherId: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  date: Date;
  duration: number;
  period?: string;
  objectives: string[];
  introduction: string;
  mainActivity: string;
  practiceActivity: string;
  conclusion: string;
  homework: string;
  teacherNotes: string;
  status: 'upcoming' | 'completed';
  resources: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonPlanSchema: Schema = new Schema(
  {
    teacherId: { type: String, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, index: true },
    grade: { type: String, required: true, index: true },
    topic: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    duration: { type: Number, default: 45 }, // in minutes
    period: { type: String, default: 'Period 1' },
    objectives: [{ type: String, trim: true }],
    introduction: { type: String, default: '' },
    mainActivity: { type: String, default: '' },
    practiceActivity: { type: String, default: '' },
    conclusion: { type: String, default: '' },
    homework: { type: String, default: '' },
    teacherNotes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['upcoming', 'completed'],
      default: 'upcoming',
      index: true,
    },
    resources: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  },
  { timestamps: true }
);

export const LessonPlan = mongoose.models.LessonPlan || mongoose.model<ILessonPlan>('LessonPlan', LessonPlanSchema);
