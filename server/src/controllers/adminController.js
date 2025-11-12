const User = require("../models/User");
const Meal = require("../models/Meal");
const MealPlan = require("../models/MealPlan");
const Progress = require("../models/Progress");
const Recommendation = require("../models/Recommendation");
const calorieService = require("../services/calorieService");
const { validateRequired, validateEmail, validatePassword } = require("../utils/validationHelper");

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching users",
      error: error.message,
    });
  }
};

// @desc    Create new user (Admin only)
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
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

    // Validation using utility (declarative approach)
    const requiredValidation = validateRequired(req.body, ["name", "email", "password"]);
    if (!requiredValidation.valid) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${requiredValidation.missing.join(", ")}`,
      });
    }

    // Email validation (declarative)
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    // Password validation (declarative)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Check if user exists (imperative: async operation)
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Validate role if provided
    if (role && !["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'user' or 'admin'",
      });
    }

    // Calculate daily calorie target using service (declarative composition)
    let dailyCalorieTarget = req.body.dailyCalorieTarget;
    if (!dailyCalorieTarget && currentWeight && height && age && gender) {
      dailyCalorieTarget = calorieService.calculateDailyCalorieTarget({
        currentWeight,
        height,
        age,
        gender,
        activityLevel: activityLevel || "moderate",
        healthGoal: healthGoal || "maintain",
      });
    }

    // Create user (imperative: database operation)
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      age,
      gender,
      height,
      currentWeight,
      targetWeight,
      healthGoal: healthGoal || "maintain",
      activityLevel: activityLevel || "moderate",
      dailyCalorieTarget,
      dietaryPreferences: dietaryPreferences || [],
      allergies: allergies || [],
    });

    // Get user without password for response
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      data: userResponse,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating user",
      error: error.message,
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user",
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { role, ...updateFields } = req.body;

    // Don't allow password updates through this endpoint
    delete updateFields.password;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update role if provided
    if (role && ["user", "admin"].includes(role)) {
      user.role = role;
    }

    // Update other fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] !== undefined) {
        user[key] = updateFields[key];
      }
    });

    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating user",
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Optionally delete related data
    // await MealPlan.deleteMany({ user: user._id });
    // await Progress.deleteMany({ user: user._id });
    // await Recommendation.deleteMany({ user: user._id });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting user",
      error: error.message,
    });
  }
};

// ==================== MEAL MANAGEMENT ====================

// @desc    Get all meals (including inactive)
// @route   GET /api/admin/meals
// @access  Private/Admin
exports.getAllMeals = async (req, res) => {
  try {
    const { isActive, mealType, page = 1, limit = 50 } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (mealType) {
      query.mealType = mealType;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const meals = await Meal.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Meal.countDocuments(query);

    res.status(200).json({
      success: true,
      data: meals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all meals error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meals",
      error: error.message,
    });
  }
};

// @desc    Restore deleted meal
// @route   PUT /api/admin/meals/:id/restore
// @access  Private/Admin
exports.restoreMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: "Meal not found",
      });
    }

    meal.isActive = true;
    meal.updatedAt = Date.now();
    await meal.save();

    res.status(200).json({
      success: true,
      data: meal,
      message: "Meal restored successfully",
    });
  } catch (error) {
    console.error("Restore meal error:", error);
    res.status(500).json({
      success: false,
      message: "Server error restoring meal",
      error: error.message,
    });
  }
};

// ==================== STATISTICS & ANALYTICS ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalMeals,
      activeMeals,
      totalMealPlans,
      activeMealPlans,
      totalProgressEntries,
      totalRecommendations,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "admin" }),
      Meal.countDocuments(),
      Meal.countDocuments({ isActive: true }),
      MealPlan.countDocuments(),
      MealPlan.countDocuments({ status: "active" }),
      Progress.countDocuments(),
      Recommendation.countDocuments(),
    ]);

    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get users with active meal plans
    const usersWithActivePlans = await MealPlan.distinct("user", {
      status: "active",
    });

    const stats = {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        recent: recentUsers,
        withActivePlans: usersWithActivePlans.length,
      },
      meals: {
        total: totalMeals,
        active: activeMeals,
        inactive: totalMeals - activeMeals,
      },
      mealPlans: {
        total: totalMealPlans,
        active: activeMealPlans,
        completed: totalMealPlans - activeMealPlans,
      },
      progress: {
        totalEntries: totalProgressEntries,
      },
      recommendations: {
        total: totalRecommendations,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching statistics",
      error: error.message,
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/:id/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    const [
      mealPlans,
      progressEntries,
      recommendations,
      mealsCreated,
    ] = await Promise.all([
      MealPlan.countDocuments({ user: userId }),
      Progress.countDocuments({ user: userId }),
      Recommendation.countDocuments({ user: userId }),
      Meal.countDocuments({ createdBy: userId }),
    ]);

    const activeMealPlans = await MealPlan.countDocuments({
      user: userId,
      status: "active",
    });

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

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching user statistics",
      error: error.message,
    });
  }
};

// ==================== MEAL PLAN MANAGEMENT ====================

// @desc    Get all meal plans
// @route   GET /api/admin/meal-plans
// @access  Private/Admin
exports.getAllMealPlans = async (req, res) => {
  try {
    const { status, userId, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const mealPlans = await MealPlan.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await MealPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: mealPlans,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all meal plans error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meal plans",
      error: error.message,
    });
  }
};

// ==================== RECOMMENDATION MANAGEMENT ====================

// @desc    Get all recommendations
// @route   GET /api/admin/recommendations
// @access  Private/Admin
exports.getAllRecommendations = async (req, res) => {
  try {
    const { status, type, userId, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (userId) query.user = userId;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const recommendations = await Recommendation.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Recommendation.countDocuments(query);

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching recommendations",
      error: error.message,
    });
  }
};

