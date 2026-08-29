import mongoose, { Schema, Document } from 'mongoose';

export interface ITimetableSlot {
  _id?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: string;
  className: string;
  subject?: string;
  room?: string;
}

export interface ITimetable extends Document {
  teacherId: string;
  slots: ITimetableSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSlotSchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  period: { type: String, required: true },
  className: { type: String, required: true, trim: true },
  subject: { type: String, default: '' },
  room: { type: String, default: '' },
});

const TimetableSchema = new Schema(
  {
    teacherId: { type: String, ref: 'User', required: true, unique: true, index: true },
    slots: [TimetableSlotSchema],
  },
  { timestamps: true }
);

export const Timetable =
  mongoose.models.Timetable || mongoose.model<ITimetable>('Timetable', TimetableSchema);
