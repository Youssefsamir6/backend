const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Smart Access & Monitoring System Backend is running");
});

// Routes
app.use("/login", require("./routes/auth.routes"));
app.use("/logs", require("./routes/log.routes"));
app.use("/alerts", require("./routes/alert.routes"));

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
