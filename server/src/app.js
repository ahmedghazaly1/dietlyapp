const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Sample route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;
