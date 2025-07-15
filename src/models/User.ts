import { Schema, model } from 'mongoose';
import { IUser } from '../types/user';

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superAdmin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model<IUser>('User', userSchema); 