const User = require("../models/User");
const calorieService = require("../services/calorieService");
const nutritionService = require("../services/nutritionService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// @desc    Get current user's full profile
// @route   GET /api/v1/users/profile/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, user);
  } catch (error) {
    console.error("Get profile error:", error);
    return sendError(res, 500, "Server error fetching profile", error.message);
  }
};

// @desc    Calculate personalized nutrition needs
// @route   GET /api/v1/users/profile/nutrition
// @access  Private
exports.calculateNutrition = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (!user.currentWeight || !user.height || !user.age || !user.gender) {
      return sendError(
        res,
        400,
        "Please complete your profile (weight, height, age, gender) to calculate nutrition needs"
      );
    }

    // Calculate target calories (declarative: service call)
    const targetCalories = calorieService.calculateDailyCalorieTarget({
      currentWeight: user.currentWeight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel || "moderate",
      healthGoal: user.healthGoal || "maintain",
    });

    // Calculate target nutrition (declarative: service call)
    const nutrition = nutritionService.calculateTargetNutrition(targetCalories);

    return sendSuccess(res, 200, {
      targetCalories,
      nutrition,
      userInfo: {
        weight: user.currentWeight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.activityLevel,
        healthGoal: user.healthGoal,
      },
    });
  } catch (error) {
    console.error("Calculate nutrition error:", error);
    return sendError(res, 500, "Server error calculating nutrition", error.message);
  }
};

// @desc    Get user statistics
// @route   GET /api/v1/users/profile/stats
// @access  Private
exports.getUserProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const MealPlan = require("../models/MealPlan");
    const Progress = require("../models/Progress");
    const Recommendation = require("../models/Recommendation");
    const Meal = require("../models/Meal");

    const [
      mealPlans,
      activeMealPlans,
      progressEntries,
      recommendations,
      mealsCreated,
    ] = await Promise.all([
      MealPlan.countDocuments({ user: userId }),
      MealPlan.countDocuments({ user: userId, status: "active" }),
      Progress.countDocuments({ user: userId }),
      Recommendation.countDocuments({ user: userId }),
      Meal.countDocuments({ createdBy: userId }),
    ]);

    const latestProgress = await Progress.findOne({ user: userId })
      .sort({ date: -1 })
      .limit(1);

    const stats = {
      mealPlans: {
        total: mealPlans,
        active: activeMealPlans,
      },
      progress: {
        totalEntries: progressEntries,
        latest: latestProgress,
      },
      recommendations: {
        total: recommendations,
      },
      mealsCreated: mealsCreated,
    };

    return sendSuccess(res, 200, stats);
  } catch (error) {
    console.error("Get user profile stats error:", error);
    return sendError(res, 500, "Server error fetching user statistics", error.message);
  }
};

// @desc    Update own profile
// @route   PUT /api/v1/users/profile/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal,
      activityLevel,
      dietaryPreferences,
      allergies,
    } = req.body;

    // Build update object (declarative: functional approach)
    const allowedFields = [
      "name",
      "age",
      "gender",
      "height",
      "currentWeight",
      "targetWeight",
      "healthGoal",
      "activityLevel",
      "dietaryPreferences",
      "allergies",
    ];

    // Declarative: reduce to build update object
    const updateFields = allowedFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) {
        acc[field] = req.body[field];
      }
      return acc;
    }, {});

    // Get current user for recalculation (imperative)
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return sendError(res, 404, "User not found");
    }

    // Recalculate calorie target if relevant fields changed (declarative composition)
    const needsRecalculation = [
      currentWeight,
      height,
      age,
      gender,
      activityLevel,
      healthGoal,
    ].some((field) => field !== undefined);

    if (needsRecalculation) {
      const userData = {
        currentWeight: updateFields.currentWeight || currentUser.currentWeight,
        height: updateFields.height || currentUser.height,
        age: updateFields.age || currentUser.age,
        gender: updateFields.gender || currentUser.gender,
        activityLevel: updateFields.activityLevel || currentUser.activityLevel,
        healthGoal: updateFields.healthGoal || currentUser.healthGoal,
      };

      // Use service for calculation (declarative)
      const calculatedTarget = calorieService.calculateDailyCalorieTarget(userData);
      if (calculatedTarget) {
        updateFields.dailyCalorieTarget = calculatedTarget;
      }
    }

    updateFields.updatedAt = Date.now();

    // Update user (imperative: database operation)
    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Response using utility (declarative)
    return sendSuccess(res, 200, user, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, "Server error updating profile", error.message);
  }
};

