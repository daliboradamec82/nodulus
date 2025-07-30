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

// Vytvoření indexů pro rychlé vyhledávání
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Složené indexy pro často používané dotazy
userSchema.index({ email: 1, role: 1 });
userSchema.index({ username: 1, role: 1 });

export default model<IUser>('User', userSchema); 