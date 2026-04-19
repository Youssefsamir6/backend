const { createLog } = require("../services/log.service");
const { createAlert } = require("../services/alert.service");

function login(req, res) {
  const { userId, gateName } = req.body;

  // 1️⃣ Validate input
  if (!userId) {
    return res.status(400).json({
      error: "userId is required"
    });
  }

  // 2️⃣ Temporary authorization logic
  const isAuthorized = false; // later from DB / AI
  const reason = isAuthorized
    ? "Authorized user"
    : "Face not recognized";

  const gate = gateName || "Main Gate";

  // 3️⃣ Always create a log
  createLog({
    userId,
    status: isAuthorized ? "Authorized" : "Unauthorized",
    reason,
    gateName: gate
  });

  // 4️⃣ Create alert only if unauthorized
  if (!isAuthorized) {
    createAlert({
      userId,
      type: "Unauthorized Access Attempt"
    });
  }

  return res.json({
    access: isAuthorized ? "Allowed" : "Denied",
    reason
  });
}

module.exports = { login };
