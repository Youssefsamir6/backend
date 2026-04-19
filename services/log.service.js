const logs = [];

function createLog({ userId, status, gateName, reason }) {
  const log = {
    id: logs.length + 1,
    userId,
    status,            // Authorized / Unauthorized
    reason,            // WHY the decision happened
    gateName,
    timestamp: new Date()
  };

  logs.push(log);
  console.log("LOG CREATED:", log);
}

function getAllLogs() {
  return logs;
}

module.exports = {
  createLog,
  getAllLogs
};
