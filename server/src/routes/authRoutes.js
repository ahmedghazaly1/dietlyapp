const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validation");
const { authLimiter } = require("../middleware/rateLimit");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
router.post("/register", authLimiter, validateRegister, register);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post("/login", authLimiter, validateLogin, login);

// @desc    Logout user
// @route   GET /api/v1/auth/logout
// @access  Private
router.get("/logout", protect, logout);

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
router.get("/me", protect, getMe);

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
router.put("/updatedetails", protect, updateProfile);

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
router.put("/updatepassword", protect, changePassword);

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
router.post("/forgotpassword", forgotPassword);

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:token
// @access  Public
router.put("/resetpassword/:token", resetPassword);

module.exports = router;
