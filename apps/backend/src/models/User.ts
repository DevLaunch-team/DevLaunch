import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  walletAddress: string;
  bio?: string;
  githubId?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
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
  username: {
    type: String,
    required: true,
    trim: true
  },
  walletAddress: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  githubId: {
    type: String
  },
  githubUsername: {
    type: String
  },
  githubAccessToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User; 