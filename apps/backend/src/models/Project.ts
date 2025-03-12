import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IProject extends Document {
  name: string;
  description: string;
  category: string;
  creator: mongoose.Types.ObjectId | IUser;
  teamMembers: mongoose.Types.ObjectId[] | IUser[];
  githubRepo?: string;
  tags: string[];
  status: 'planning' | 'in-progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['web', 'mobile', 'desktop', 'blockchain', 'ai', 'other']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  githubRepo: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/github\.com\/[\w-]+\/[\w-]+(\.git)?$/.test(v);
      },
      message: props => `${props.value} is not a valid GitHub repository URL!`
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'abandoned'],
    default: 'planning'
  }
}, {
  timestamps: true
});

// Create indices for faster querying
ProjectSchema.index({ name: 'text', description: 'text' });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ creator: 1 });
ProjectSchema.index({ 'teamMembers': 1 });

const Project = mongoose.model<IProject>('Project', ProjectSchema);

export default Project; 