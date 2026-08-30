import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  institution?: string;
  subject?: string;
  grade?: string;
  bio?: string;
  phone?: string;
  location?: string;
  yearsOfExperience?: number | string;
  savedResources?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, trim: true, index: true },
    image: { type: String },
    institution: { type: String, default: '' },
    subject: { type: String, default: '' },
    grade: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    yearsOfExperience: { type: Schema.Types.Mixed, default: '' },
    savedResources: [{ type: String, ref: 'Resource' }],
  },
  { timestamps: true, collection: 'user' }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
