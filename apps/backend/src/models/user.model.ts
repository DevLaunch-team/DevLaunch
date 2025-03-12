import mongoose, { Document, Schema } from 'mongoose';
import { hash, compare } from 'bcrypt';

export interface UserDocument extends Document {
  email: string;
  password: string;
  username: string;
  walletAddress?: string;
  bio?: string;
  githubId?: string;
  githubUsername?: string;
  githubToken?: string;
  createdAt: Date;
  updatedAt?: Date;
  tokens?: string[]; // Array of token addresses created by user
  verificationLevel: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  walletAddress: { type: String },
  bio: { type: String },
  githubId: { type: String },
  githubUsername: { type: String },
  githubToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  tokens: [{ type: String }],
  verificationLevel: { type: Number, default: 0 }
});

// Create indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ walletAddress: 1 }, { sparse: true });
UserSchema.index({ githubUsername: 1 }, { sparse: true });

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await compare(candidatePassword, this.password);
};

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export default UserModel; 