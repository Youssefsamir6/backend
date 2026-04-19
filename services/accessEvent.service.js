const User = require('../models/User.model');
const Log = require('../models/Log.model');
const { createLog } = require('./log.service');
const { createAlert } = require('./alert.service');

// Global io from server
const io = global.io;

/**
 * Central function: Device → API → Decision → Save Log → Emit Event → Frontend
 * @param {Object} data - {userId?: string, rfid?: string, image?: base64, method: 'rfid'|'face'|'manual', gateName: string}
 * @returns {Promise<{decision: Object, log: Object}>}
 */
const handleAccessEvent = async (data) => {
  const { userId: providedUserId, rfid, image, method, gateName = 'Main Gate' } = data;

  // Step 1: Identify user
  let identifiedUserId = null;
  let identificationReason = '';

  if (providedUserId) {
    const user = await User.findById(providedUserId);
    if (user) {
      identifiedUserId = user._id;
      identificationReason = 'Provided userId validated';
    } else {
      identificationReason = 'Invalid provided userId';
    }
  } else if (rfid) {
    // Mock RFID lookup (extend with real RFID-user mapping)
    const user = await User.findOne({ rfid }); // Assume User has rfid field or extend model
    if (user) {
      identifiedUserId = user._id;
      identificationReason = `RFID ${rfid} matched`;
    } else {
      identificationReason = `Unknown RFID ${rfid}`;
    }
  } else if (image && method === 'face') {
    const rec = await recognizeFace(image);
    identifiedUserId = rec.userId;
    identificationReason = `Face rec: ${rec.confidence.toFixed(2)} conf (${rec.status})`;
  } else {
    throw new Error('No identification method provided (userId, rfid, or image+face)');
  }

  // Step 2: Decide (allow/deny)
  const decision = await smartDecision(image || null, gateName, identifiedUserId);
  decision.identification = { userId: identifiedUserId, reason: identificationReason };

  // Step 3-5: Save log → alert if needed → emit events (handled by createLog)
  const logData = {
    userId: identifiedUserId || 'unknown',
    status: decision.status,
    method,
    reason: decision.reason,
    gateName,
    identificationReason
  };
  const log = await createLog(logData);

  return { decision, log };
};

// Moved from ai.service.js
const recognizeFace = async (imageBase64) => {
  // Simulate hash from base64 for deterministic mock
  const hash = imageBase64.slice(-8);
  const faceId = parseInt(hash, 16) % 1000;

  const users = await User.find({}, 'email _id');
  const knownEmails = ['admin@test.com', 'guard@test.com', 'user@test.com'];
  const KNOWN_FACES = {
    'admin@test.com': { minConf: 0.85, maxConf: 0.99 },
    'guard@test.com': { minConf: 0.82, maxConf: 0.98 },
    'user@test.com': { minConf: 0.78, maxConf: 0.95 }
  };
  
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

const smartDecision = async (imageBase64, gateName, identifiedUserId = null) => {
  let rec = { status: 'authorized', confidence: 1.0, reason: 'Pre-identified user' };

  if (imageBase64) {
    rec = await recognizeFace(imageBase64);
  }

  // Check recent logs for suspicious patterns
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentLogs = await Log.find({
    timestamp: { $gte: hourAgo },
    status: 'Unauthorized',
    method: rec.method || 'face'
  }).limit(5);

  let finalStatus = identifiedUserId ? 'Authorized' : (rec.status === 'authorized' ? 'Authorized' : 'Unauthorized');
  let reason = rec.reason || 'Pre-authorized user';

  // Smart override: low conf + recent denies → deny (unless pre-identified)
  if (!identifiedUserId && rec.confidence < 0.75 && recentLogs.length >= 3) {
    finalStatus = 'Unauthorized';
    reason = `Suspicious: ${recentLogs.length} recent denies + low conf (${rec.confidence})`;
  }

  return {
    ...rec,
    status: finalStatus,
    reason,
    gateName,
    identifiedUserId,
    readyForLog: true
  };
};

module.exports = { handleAccessEvent, recognizeFace, smartDecision };

