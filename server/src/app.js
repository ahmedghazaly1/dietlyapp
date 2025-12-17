const express = require("express");
const cors = require("cors");
const { errorHandler, notFound } = require("./middleware/error");
const { securityHeaders, sanitizeData } = require("./middleware/security");
const { generalLimiter, authLimiter } = require("./middleware/rateLimit");

const app = express();

// Import route files
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const mealRoutes = require("./routes/mealRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const progressRoutes = require("./routes/progressRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes"); // Add this line

// ==================== MIDDLEWARE SETUP ====================

// Security middleware (FIRST)
app.use(securityHeaders);
app.use(cors({
  origin: [
    'http://localhost:5000', // For local development
    'https://dietlyapp.vercel.app' // ✅ Add your LIVE frontend URL here
  ],
  credentials: true
}));
app.use(sanitizeData);

// Rate limiting (AFTER security, BEFORE routes)
app.use(generalLimiter);
app.use("/api/v1/auth", authLimiter);

// Body parsing middleware
app.use(express.json());

// ==================== ROUTES ====================

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/meals", mealRoutes);
app.use("/api/v1/meal-plans", mealPlanRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/chatbot", chatbotRoutes); // Add this line

// ==================== ERROR HANDLING ====================

// 404 handler (AFTER all routes)
app.use(notFound);

// Global error handler (LAST)
app.use(errorHandler);

module.exports = app;

