require("dotenv").config();
const mongoose = require("mongoose");

// Import your Express app from src/app.js
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// 1. START THE SERVER FIRST, independent of DB
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check at: http://localhost:${PORT}/api/health`);
});

// 2. THEN, try to connect to MongoDB (non-blocking)
if (!process.env.DATABASE) {
  console.warn("⚠️  DATABASE environment variable is not set! Running without DB.");
} else {
  let DB = process.env.DATABASE;
  
  // Password replacement logic (keep your existing logic here)
  if (DB && DB.includes("<PASSWORD>")) {
    if (!process.env.DATABASE_PASSWORD) {
      console.error("❌ DATABASE_PASSWORD is required when using <PASSWORD> placeholder!");
    } else {
      DB = DB.replace("<PASSWORD>", encodeURIComponent(process.env.DATABASE_PASSWORD));
    }
  }

  // Database name logic (keep your existing logic here)
  const defaultDbName = process.env.DB_NAME || "dietly";
  const hasExplicitDb = /mongodb\.net\/[^?]+\?/.test(DB);
  if (DB && !hasExplicitDb) {
    DB = DB.replace("mongodb.net/?", `mongodb.net/${defaultDbName}?`);
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  };

  mongoose.connect(DB, connectionOptions)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      console.warn("⚠️  Application is running WITHOUT database connection.");
    });

    // Add at the VERY END of your server.js file (after all other code)
process.on('uncaughtException', (error) => {
  console.error('🔥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
}