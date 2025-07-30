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

// Vytvoření indexů pro rychlé vyhledávání
positionSchema.index({ NamePosition: 1 });
positionSchema.index({ Account: 1 });
positionSchema.index({ createdAt: -1 });
positionSchema.index({ updatedAt: -1 });

// Složené indexy pro často používané dotazy
positionSchema.index({ NamePosition: 1, Account: 1 });
positionSchema.index({ Account: 1, createdAt: -1 });

export const Position = mongoose.model('UserPosition', positionSchema); 