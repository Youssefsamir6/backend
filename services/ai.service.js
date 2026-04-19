const User = require('../models/User.model');
const Log = require('../models/Log.model');

// Known faces for mock (email → conf range)
const KNOWN_FACES = {
  'admin@test.com': { minConf: 0.85, maxConf: 0.99 },
  'guard@test.com': { minConf: 0.82, maxConf: 0.98 },
  'user@test.com': { minConf: 0.78, maxConf: 0.95 }
};

// Mock AI Face Recognition (enhanced with context)
const recognizeFace = async (imageBase64) => {
  // Simulate hash from base64 for deterministic mock
  const hash = imageBase64.slice(-8); // last 8 chars as "face id"
  const faceId = parseInt(hash, 16) % 1000;

  const users = await User.find({}, 'email _id');
  const knownEmails = Object.keys(KNOWN_FACES);
  
  // 60% known high conf, 25% unknown low, 15% suspicious medium
  let userId = null, confidence, status, reason = 'Face recognized';

  if (faceId % 10 < 6) { // known
    const email = knownEmails[faceId % knownEmails.length];
    const range = KNOWN_FACES[email];
    confidence = (Math.random() * (range.maxConf - range.minConf) + range.minConf).toFixed(2);
    const user = users.find(u => u.email === email);
    if (user) userId = user._id;
    status = 'authorized';
  } else if (faceId % 10 < 8.5) { // suspicious
    confidence = (0.5 + Math.random() * 0.25).toFixed(2);
    status = 'suspicious';
    reason = 'Low confidence match';
  } else { // unknown
    confidence = (0.1 + Math.random() * 0.3).toFixed(2);
    status = 'unknown';
    reason = 'Unknown face';
  }

  return {
    userId,
    confidence: parseFloat(confidence),
    status,
    reason,
    method: 'face'
  };
};

// Smart decision with log context (e.g., recent denies → auto-deny)
const smartDecision = async (imageBase64, gateName = 'Main Gate') => {
  const rec = await recognizeFace(imageBase64);
  
  // Check recent logs for this "face" pattern (mock via rec.status history)
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentLogs = await Log.find({
    timestamp: { $gte: hourAgo },
    status: 'Unauthorized',
    method: 'face'
  }).limit(5);

  let finalStatus = rec.status === 'authorized' ? 'Authorized' : 'Unauthorized';
  let reason = rec.reason;

  // Smart override: if low conf + recent face denies at gate → deny
  if (rec.confidence < 0.75 && recentLogs.length >= 3 && rec.status !== 'authorized') {
    finalStatus = 'Unauthorized';
    reason = `Suspicious pattern: ${recentLogs.length} recent denies + low conf (${rec.confidence})`;
  }

  return {
    ...rec,
    status: finalStatus,
    reason,
    gateName,
    // Ready for direct log creation
    readyForLog: true
  };
};

module.exports = { recognizeFace, smartDecision };

