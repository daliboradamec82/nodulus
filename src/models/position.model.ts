import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  NamePosition: {
    type: String,
    required: true,
    trim: true
  },
  DescribePosition: {
    type: String,
    required: true,
    trim: true
  },
  Account: {
    type: String,
    required: true,
    trim: true
  },
  AnalyzePositions: {
    type: Array,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  _id: false // Zakážeme automatické generování _id
});

export const Position = mongoose.model('UserPosition', positionSchema); 