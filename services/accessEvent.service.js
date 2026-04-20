const User = require('../models/User.model');
const Log = require('../models/Log.model');
const Alert = require('../models/Alert.model');

// Services
const { createLog } = require('./log.service');
const { recognizeFace: aiRecognize } = require('./ai.service');

/**
 * Central access control function following exact specification
 * @param {Object} data - { userId, method: \"face\"|\"card\", timestamp, deviceId, confidence (for AI), gateName?, image? }
 * @returns {Promise<{success: boolean, status?: string, error?: string}>}
 */
async function handleAccessEvent(data) {
  try {
    // 1. Input validation (strict per spec)
    const { userId, method, timestamp = new Date(), deviceId, confidence, gateName = 'Main Gate', image } = data;
    
    if (!method || !deviceId) {
      throw new Error('Missing required fields: method, deviceId');
    }

    // Auto AI recognition for anonymous face access
    let effectiveUserId = userId;
    let effectiveConfidence = confidence;
    if (method === 'face' && image && !effectiveUserId) {
      const rec = await aiRecognize(image);
      effectiveUserId = rec.userId;
      effectiveConfidence = rec.confidence;
    }

    // 2. Identify/lookup user
    const user = await User.findById(effectiveUserId).select('name email isActive');

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

    // Central logging via service (DB + emit + alert)
    await createLog({
      userId: user ? user._id : null,
      status: logStatus,
      method: data.method,
      timestamp: timestamp,
      deviceId,
      confidence: effectiveConfidence,
      reason: status === 'authorized' ? 'Active user, within time window' : 
              (user ? 'Inactive user or outside time window' : 'User not found'),
      gateName
    });

    return { success: true, status };

  } catch (error) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

const smartDecision = async (imageBase64, gateName, identifiedUserId = null) => {
  let rec = { status: 'authorized', confidence: 1.0, reason: 'Pre-identified user' };

  if (imageBase64) {
    rec = await aiRecognize(imageBase64);
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

module.exports = { handleAccessEvent, smartDecision };

