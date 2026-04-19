const { getAllLogs } = require("../services/log.service");

function getLogs(req, res) {
  const logs = getAllLogs();
  res.json(logs);
}

module.exports = { getLogs };
