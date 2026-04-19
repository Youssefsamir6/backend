const User = require('../models/User.model');
const Log = require('../models/Log.model');
const Alert = require('../models/Alert.model');

// For legacy/hybrid support
const { createLog } = require('./log.service');

// Global io from server
const io = global.io;

/**
 * Central access control function following exact specification
 * @param {Object} data - { userId, method: "face"|"card", timestamp, deviceId, confidence (for AI), gateName? }
 * @returns {Promise<{success: boolean, status?: string, error?: string}>}
 */
async function handleAccessEvent(data) {
  try {
    // 1. Input validation (strict per spec)
    const { userId, method, timestamp = new Date(), deviceId, confidence, gateName = 'Main Gate' } = data;
    
    if (!userId || !method || !deviceId) {
      throw new Error('Missing required fields: userId, method, deviceId');
    }

    // 2. Identify/lookup user
    const user = await User.findById(data.userId).select('name email isActive'); // Assume 'name' added or use email

    // 3. Decision engine
    let status = "denied";

    if (user && user.isActive) {
      const now = new Date(); // Use current time (timestamp logged separately)
      
      // Time-based rule (8am-6pm)
      if (now.getHours() >= 8 && now.getHours() <= 18) {
        status = "authorized";
      } else {
        status = "denied"; // Time violation
      }
    } else {
      status = "denied"; // Inactive or not found
    }

    // Status for logging (capitalize)
    const logStatus = status === 'authorized' ? 'Authorized' : 'Unauthorized';

    // 4. Save log (direct model create)
    const log = await Log.create({
      userId: user ? user._id : null,
      status: logStatus,
      method: data.method,
      timestamp: timestamp,
      deviceId,
      confidence: confidence || null,
      reason: status === 'authorized' ? 'Active user, within time window' : 
              (user ? 'Inactive user or outside time window' : 'User not found'),
      gateName
    });

    // 5. Alert if denied
    if (status === "denied") {
      await Alert.create({
        type: "unauthorized_access",
        message: "Access denied",
        userId: user ? user._id : null,
        severity: 'high',
        timestamp: new Date()
      });

      // Emit alert (global)
      io.emit("alert", {
        type: "unauthorized",
        user: user ? (user.name || user.email) : "Unknown"
      });
    }

    // 6. Emit real-time event (exact task format)
    io.emit("access_event", {
      user: user ? (user.name || user.email) : "Unknown",
      status: logStatus,
      method: data.method,
      time: new Date()
    });

    return { success: true, status };

  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Legacy functions (unchanged)
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

