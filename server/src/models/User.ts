import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  institution?: string;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    institution: { type: String, default: '' },
    subject: { type: String, default: '' },
  },
  { timestamps: true, collection: 'user' } // Better-Auth uses 'user' collection
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
