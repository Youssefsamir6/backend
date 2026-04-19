const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Authorized', 'Unauthorized'],
    required: true
  },
  method: {
    type: String,
    enum: ['card', 'face', 'manual'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  gateName: {
    type: String,
    default: 'Main Gate'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Log', logSchema);

