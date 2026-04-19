const User = require('../models/User.model');

// Mock AI - in real use OpenAI Vision or AWS Rekognition
const recognizeFace = async (imageBase64) => {
  // Mock: 80% match to random user, or unknown
  const confidence = (Math.random() * 0.3 + 0.7).toFixed(2); // 0.7-1.0
  const isMatch = Math.random() > 0.2; // 80% match

  if (!isMatch) {
    return {
      user: null,
      confidence: parseFloat(confidence),
      status: 'unknown'
    };
  }

  // Mock user match
  const users = await User.find({}, 'email');
  const randomUser = users[Math.floor(Math.random() * users.length)];
  return {
    user: randomUser.email,
    userId: randomUser._id,
    confidence: parseFloat(confidence),
    status: 'authorized'
  };
};

module.exports = { recognizeFace };

