import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superAdmin';
  createdAt: Date;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  email: string;
} 