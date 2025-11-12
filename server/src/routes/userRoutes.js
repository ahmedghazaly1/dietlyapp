const express = require('express');
const router = express.Router();
const {

  getProfile,
  calculateNutrition,
  getUserProfileStats,
} = require('../controllers/userController');
const { updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserUpdate } = require('../middleware/validation');

// All routes here are for the LOGGED-IN USER to manage their OWN profile
// Admin user management is in adminRoutes.js at /api/v1/admin/users

// @desc    Get current user's full profile
// @route   GET /api/v1/users/profile/me
// @access  Private
router.get('/profile/me', protect, getProfile);

// @desc    Update own profile
// @route   PUT /api/v1/users/profile/update
// @access  Private
router.put('/profile/update', protect, validateUserUpdate, updateProfile);

// @desc    Calculate personalized nutrition needs
// @route   GET /api/v1/users/profile/nutrition
// @access  Private
router.get('/profile/nutrition', protect, calculateNutrition);

// @desc    Get user statistics
// @route   GET /api/v1/users/profile/stats
// @access  Private
router.get('/profile/stats', protect, getUserProfileStats);

module.exports = router
