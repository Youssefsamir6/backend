const express = require("express");
const router = express.Router();
const {
  getAlerts,
  markAlertAsRead
} = require("../controllers/alert.controller");

router.get("/", getAlerts);
router.patch("/:id/read", markAlertAsRead);

module.exports = router;
