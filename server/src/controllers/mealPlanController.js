const MealPlan = require("../models/MealPlan");
const Meal = require("../models/Meal");
const User = require("../models/User");
const nutritionService = require("../services/nutritionService");
const mealSelectionService = require("../services/mealSelectionService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const MEAL_PLAN_POPULATE_PATHS = [
  "days.meals.breakfast.meal",
  "days.meals.lunch.meal",
  "days.meals.dinner.meal",
  "days.meals.snacks.meal",
  "weeklyMealOptions.breakfastOptions",
  "weeklyMealOptions.lunchOptions",
  "weeklyMealOptions.dinnerOptions",
  "weeklyMealOptions.snackOptions",
];

const populateMealPlanQuery = (query) => {
  return MEAL_PLAN_POPULATE_PATHS.reduce(
    (acc, path) => acc.populate(path),
    query
  );
};

const MIN_WEEKLY_OPTIONS = 3;
const MIN_AUTO_DURATION = 7;
const MAX_AUTO_DURATION = 30;

const pickWeeklyOptions = (
  meals,
  mealType,
  optionsCount = MIN_WEEKLY_OPTIONS,
  allowSmaller = false
) => {
  if (!meals || meals.length === 0) {
    if (allowSmaller) {
      return [];
    }
    throw new Error(`No ${mealType} meals available to build a meal plan.`);
  }

  if (!allowSmaller && meals.length < optionsCount) {
    throw new Error(
      `Not enough ${mealType} meals to build weekly alternates. Need at least ${optionsCount}, found ${meals.length}.`
    );
  }

  const desiredCount = allowSmaller
    ? Math.min(optionsCount, meals.length)
    : optionsCount;
  return mealSelectionService.selectRandomMeals(meals, desiredCount);
};

const recalcDayCalorieSummary = async (day, fallbackTarget = 0) => {
  if (!day) {
    return 0;
  }

  const normalizedTarget =
    day.calorieSummary?.targetCalories || fallbackTarget || 0;
  day.calorieSummary = {
    targetCalories: normalizedTarget,
    consumedCalories: day.calorieSummary?.consumedCalories || 0,
    lastUpdated: day.calorieSummary?.lastUpdated,
  };

  const consumedEntries = [];
  const pushConsumed = (entry) => {
    if (entry && entry.consumed) {
      const mealId =
        typeof entry.meal === "object" && entry.meal !== null
          ? entry.meal._id || entry.meal.id || entry.meal
          : entry.meal;
      if (mealId) {
        consumedEntries.push({
          meal: mealId.toString(),
          servings: entry.servings || 1,
        });
      }
    }
  };

  pushConsumed(day.meals?.breakfast);
  pushConsumed(day.meals?.lunch);
  pushConsumed(day.meals?.dinner);
  (day.meals?.snacks || []).forEach((snack) => pushConsumed(snack));

  if (consumedEntries.length === 0) {
    day.calorieSummary.consumedCalories = 0;
    day.calorieSummary.lastUpdated = new Date();
    return 0;
  }

  const uniqueMealIds = [
    ...new Set(consumedEntries.map((entry) => entry.meal)),
  ];
  const mealDocs = await Meal.find({ _id: { $in: uniqueMealIds } }).select(
    "_id nutrition.calories"
  );
  const caloriesByMealId = mealDocs.reduce((acc, meal) => {
    const calories = meal.nutrition?.calories || 0;
    acc.set(meal._id.toString(), calories);
    return acc;
  }, new Map());

  const totalCalories = consumedEntries.reduce((sum, entry) => {
    const perServingCalories = caloriesByMealId.get(entry.meal) || 0;
    return sum + perServingCalories * (entry.servings || 1);
  }, 0);

  day.calorieSummary.consumedCalories = Math.round(totalCalories);
  day.calorieSummary.lastUpdated = new Date();

  return day.calorieSummary.consumedCalories;
};

// @desc    Generate structured meal plan with weekly rotations
// @route   POST /api/meal-plans/generate
// @access  Private
exports.generateMealPlan = async (req, res) => {
  try {
    const { startDate, duration = MIN_AUTO_DURATION } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingActivePlan = await MealPlan.findOne({
      user: req.user.id,
      status: "active",
    });

    if (existingActivePlan) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active meal plan. Please complete or stop it before generating a new one.",
      });
    }

    const normalizedDuration = Math.min(
      MAX_AUTO_DURATION,
      Math.max(MIN_AUTO_DURATION, parseInt(duration, 10) || MIN_AUTO_DURATION)
    );

    const targetCalories = user.dailyCalorieTarget || 2000;
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + normalizedDuration - 1);

    const targetNutrition =
      nutritionService.calculateTargetNutrition(targetCalories);

    console.log("🔍 Meal Plan Generation Debug:");
    console.log("User ID:", user._id);
    console.log("Target Calories:", targetCalories);
    console.log("Duration:", normalizedDuration);

    let [breakfastMeals, lunchMeals, dinnerMeals, snackMeals] =
      await Promise.all([
        mealSelectionService.selectMealsForUser(
          user,
          "breakfast",
          targetCalories * 0.25
        ),
        mealSelectionService.selectMealsForUser(
          user,
          "lunch",
          targetCalories * 0.35
        ),
        mealSelectionService.selectMealsForUser(
          user,
          "dinner",
          targetCalories * 0.35
        ),
        mealSelectionService.selectMealsForUser(
          user,
          "snack",
          targetCalories * 0.05
        ),
      ]);

    if (
      breakfastMeals.length === 0 ||
      lunchMeals.length === 0 ||
      dinnerMeals.length === 0
    ) {
      console.log(
        "⚠️  Not enough meals with calorie constraints, retrying without calorie filters..."
      );
      [breakfastMeals, lunchMeals, dinnerMeals, snackMeals] = await Promise.all(
        [
          mealSelectionService.selectMealsForUser(user, "breakfast", null),
          mealSelectionService.selectMealsForUser(user, "lunch", null),
          mealSelectionService.selectMealsForUser(user, "dinner", null),
          mealSelectionService.selectMealsForUser(user, "snack", null),
        ]
      );
    }

    const availableCounts = {
      breakfast: breakfastMeals.length,
      lunch: lunchMeals.length,
      dinner: dinnerMeals.length,
      snack: snackMeals.length,
    };

    const weeks = Math.ceil(normalizedDuration / 7);
    const weeklyMealOptions = [];
    const days = [];
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    const buildSnackPlanForDay = (snackOptions, rotationIndex) => {
      if (!snackOptions || snackOptions.length === 0) {
        return [];
      }

      const snackCount = snackOptions.length > 1 && Math.random() > 0.5 ? 2 : 1;
      const selections = [];

      for (let i = 0; i < snackCount; i++) {
        const option = snackOptions[(rotationIndex + i) % snackOptions.length];
        selections.push({
          meal: option._id,
          servings: 1,
          consumed: false,
        });
      }

      return selections;
    };

    let globalDayIndex = 0;

    for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
      const breakfastOptions = pickWeeklyOptions(
        breakfastMeals,
        "breakfast",
        MIN_WEEKLY_OPTIONS,
        true
      );
      const lunchOptions = pickWeeklyOptions(
        lunchMeals,
        "lunch",
        MIN_WEEKLY_OPTIONS,
        true
      );
      const dinnerSourceMeals =
        dinnerMeals.length >= 1 ? dinnerMeals : lunchMeals; // fallback to lunch for dinner
      const dinnerOptions = pickWeeklyOptions(
        dinnerSourceMeals,
        "dinner",
        MIN_WEEKLY_OPTIONS,
        true
      );
      const snackOptions = pickWeeklyOptions(
        snackMeals,
        "snack",
        MIN_WEEKLY_OPTIONS,
        true
      );

      weeklyMealOptions.push({
        weekNumber: weekIndex + 1,
        breakfastOptions: breakfastOptions.map((meal) => meal._id),
        lunchOptions: lunchOptions.map((meal) => meal._id),
        dinnerOptions: dinnerOptions.map((meal) => meal._id),
        snackOptions: snackOptions.map((meal) => meal._id),
      });

      for (
        let dayOfWeek = 0;
        dayOfWeek < 7 && globalDayIndex < normalizedDuration;
        dayOfWeek++
      ) {
        const rotationIndex = dayOfWeek % MIN_WEEKLY_OPTIONS;
        const date = new Date(
          start.getTime() + globalDayIndex * millisecondsPerDay
        );

        const breakfast =
          breakfastOptions[rotationIndex % breakfastOptions.length];
        const lunch = lunchOptions[rotationIndex % lunchOptions.length];
        const dinner = dinnerOptions[rotationIndex % dinnerOptions.length];
        const snacks = buildSnackPlanForDay(snackOptions, rotationIndex);

        // Adjust servings to better hit target calories
        const desiredBreakfast = Math.round(targetCalories * 0.25);
        const desiredLunch = Math.round(targetCalories * 0.35);
        const desiredDinner = Math.round(targetCalories * 0.35);
        const desiredSnacks = Math.round(targetCalories * 0.05);

        const bcals = Math.max(
          1,
          Math.round(breakfast.nutrition?.calories || 400)
        );
        const lcals = Math.max(1, Math.round(lunch.nutrition?.calories || 700));
        const dcals = Math.max(
          1,
          Math.round(dinner.nutrition?.calories || 900)
        );

        let bServ = Math.max(1, Math.round(desiredBreakfast / bcals));
        let lServ = Math.max(1, Math.round(desiredLunch / lcals));
        let dServ = Math.max(1, Math.round(desiredDinner / dcals));

        // Build snacks to approach desiredSnacks calories
        let snackSelections = [...snacks];
        const findSnackOptById = (id) =>
          snackOptions.find((o) => o._id.toString() === id.toString());
        let snackTotal = snackSelections.reduce((sum, s) => {
          const opt = findSnackOptById(s.meal);
          const cals = Math.max(0, Math.round(opt?.nutrition?.calories || 200));
          return sum + cals * (s.servings || 1);
        }, 0);
        // Prefer adding servings of the highest-calorie snack
        const sortedSnackOpts = [...snackOptions].sort(
          (a, b) => (b.nutrition?.calories || 0) - (a.nutrition?.calories || 0)
        );
        const topSnack = sortedSnackOpts[0];
        while (snackTotal < desiredSnacks && snackSelections.length < 4) {
          if (topSnack) {
            snackSelections.push({
              meal: topSnack._id,
              servings: 1,
              consumed: false,
            });
            snackTotal += Math.max(
              1,
              Math.round(topSnack.nutrition?.calories || 200)
            );
          } else {
            break;
          }
        }

        const tolerance = Math.max(150, Math.round(targetCalories * 0.05));
        const calcDayTotal = () =>
          bServ * bcals +
          lServ * lcals +
          dServ * dcals +
          snackSelections.reduce((sum, s) => {
            const opt = findSnackOptById(s.meal);
            const c = Math.max(0, Math.round(opt?.nutrition?.calories || 200));
            return sum + c * (s.servings || 1);
          }, 0);
        let dayTotal = calcDayTotal();
        let guard = 0;
        while (dayTotal > targetCalories + tolerance && guard < 50) {
          if (dServ > 1) {
            dServ -= 1;
          } else if (lServ > 1) {
            lServ -= 1;
          } else if (bServ > 1) {
            bServ -= 1;
          } else if (snackSelections.length > 0) {
            snackSelections.pop();
          } else {
            break;
          }
          dayTotal = calcDayTotal();
          guard++;
        }
        guard = 0;
        while (dayTotal < targetCalories - tolerance && guard < 50) {
          if (snackSelections.length < 6 && topSnack) {
            snackSelections.push({
              meal: topSnack._id,
              servings: 1,
              consumed: false,
            });
          } else if (dServ < 4) {
            dServ += 1;
          } else if (lServ < 4) {
            lServ += 1;
          } else if (bServ < 4) {
            bServ += 1;
          } else {
            break;
          }
          dayTotal = calcDayTotal();
          guard++;
        }

        days.push({
          date,
          weekNumber: weekIndex + 1,
          meals: {
            breakfast: {
              meal: breakfast._id,
              servings: bServ,
              consumed: false,
            },
            lunch: {
              meal: lunch._id,
              servings: lServ,
              consumed: false,
            },
            dinner: {
              meal: dinner._id,
              servings: dServ,
              consumed: false,
            },
            snacks: snackSelections,
          },
          calorieSummary: {
            targetCalories: targetCalories,
            consumedCalories: 0,
          },
        });

        globalDayIndex++;
      }
    }

    const totalMeals = days.reduce(
      (sum, day) => sum + 3 + day.meals.snacks.length,
      0
    );

    const mealPlan = await MealPlan.create({
      user: user._id,
      startDate: start,
      endDate: end,
      duration: normalizedDuration,
      days,
      weeklyMealOptions,
      targetNutrition,
      status: "active",
      generatedBy: "auto",
      adherence: {
        totalMeals,
        consumedMeals: 0,
        adherencePercentage: 0,
      },
      calorieRing: {
        targetDailyCalories: targetCalories,
        activeDate: days[0]?.date || start,
        consumedCalories: 0,
        completionPercentage: 0,
      },
    });

    const populatedPlan = await populateMealPlanQuery(
      MealPlan.findById(mealPlan._id)
    );

    res.status(201).json({
      success: true,
      data: populatedPlan,
    });
  } catch (error) {
    console.error("Generate meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error generating meal plan",
      error: error.message,
    });
  }
};

// @desc    Get all meal plans for user
// @route   GET /api/meal-plans
// @access  Private
exports.getMealPlans = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const mealPlansQuery = MealPlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const mealPlans = await populateMealPlanQuery(mealPlansQuery);

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
    console.error("Get meal plans error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meal plans",
      error: error.message,
    });
  }
};

// @desc    Get single meal plan
// @route   GET /api/meal-plans/:id
// @access  Private
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlanQuery = MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    const mealPlan = await populateMealPlanQuery(mealPlanQuery);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // if (mealPlan.status !== "active") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Meal plan is not active and cannot be updated",
    //   });
    // }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("Get meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching meal plan",
      error: error.message,
    });
  }
};

// @desc    Update meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
exports.updateMealPlan = async (req, res) => {
  try {
    let mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Update allowed fields
    const { status, days, name } = req.body;

    if (status) mealPlan.status = status;
    if (name) mealPlan.name = name;
    if (days) mealPlan.days = days;

    mealPlan.updatedAt = Date.now();
    await mealPlan.save();

    const updatedPlan = await populateMealPlanQuery(
      MealPlan.findById(mealPlan._id)
    );

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Update meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating meal plan",
      error: error.message,
    });
  }
};

// @desc    Mark meal as consumed
// @route   PUT /api/meal-plans/:id/consume
// @access  Private
exports.markMealConsumed = async (req, res) => {
  try {
    const { dayIndex, mealType, snackIndex, consumed = true, date } = req.body;

    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    let day = null;
    if (dayIndex !== undefined && dayIndex !== null) {
      const idx = parseInt(dayIndex, 10);
      if (Number.isNaN(idx) || idx < 0 || idx >= mealPlan.days.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid day index",
        });
      }
      day = mealPlan.days[idx];
    } else if (date) {
      const requestedDate = new Date(date);
      requestedDate.setHours(0, 0, 0, 0);
      day =
        mealPlan.days.find((d) => {
          const dDate = new Date(d.date);
          dDate.setHours(0, 0, 0, 0);
          return dDate.getTime() === requestedDate.getTime();
        }) || null;
      if (!day) {
        return res.status(404).json({
          success: false,
          message: "No meals scheduled for the requested date",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Provide a valid dayIndex or date",
      });
    }

    if (mealType === "snack") {
      if (
        snackIndex === undefined ||
        snackIndex < 0 ||
        snackIndex >= day.meals.snacks.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid snack index",
        });
      }
      day.meals.snacks[snackIndex].consumed = consumed;
      day.meals.snacks[snackIndex].consumedAt = consumed ? new Date() : null;
    } else if (["breakfast", "lunch", "dinner"].includes(mealType)) {
      day.meals[mealType].consumed = consumed;
      day.meals[mealType].consumedAt = consumed ? new Date() : null;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid meal type",
      });
    }

    // Recalculate adherence
    let consumedMeals = 0;
    mealPlan.days.forEach((d) => {
      if (d.meals.breakfast.consumed) consumedMeals++;
      if (d.meals.lunch.consumed) consumedMeals++;
      if (d.meals.dinner.consumed) consumedMeals++;
      d.meals.snacks.forEach((snack) => {
        if (snack.consumed) consumedMeals++;
      });
    });

    mealPlan.adherence.consumedMeals = consumedMeals;
    mealPlan.adherence.adherencePercentage =
      mealPlan.adherence.totalMeals > 0
        ? Math.round((consumedMeals / mealPlan.adherence.totalMeals) * 100)
        : 0;

    const defaultTarget =
      day.calorieSummary?.targetCalories ||
      mealPlan.calorieRing?.targetDailyCalories ||
      mealPlan.targetNutrition?.dailyCalories ||
      0;

    const consumedCalories = await recalcDayCalorieSummary(day, defaultTarget);
    const effectiveTarget = day.calorieSummary?.targetCalories || defaultTarget;

    mealPlan.calorieRing = {
      targetDailyCalories: effectiveTarget,
      activeDate: day.date,
      consumedCalories,
      completionPercentage:
        effectiveTarget > 0
          ? Math.min(
              100,
              Math.round((consumedCalories / effectiveTarget) * 100)
            )
          : 0,
    };

    mealPlan.updatedAt = Date.now();
    await mealPlan.save();

    const updatedPlan = await populateMealPlanQuery(
      MealPlan.findById(mealPlan._id)
    );

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Mark meal consumed error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating meal consumption",
      error: error.message,
    });
  }
};

// @desc    Stop an active meal plan before completion
// @route   PUT /api/meal-plans/:id/stop
// @access  Private
exports.stopMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    if (mealPlan.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Meal plan is not active and cannot be stopped",
      });
    }

    const stopTimestamp = new Date();
    const stopDate = new Date(stopTimestamp);
    stopDate.setHours(0, 0, 0, 0);

    mealPlan.status = "cancelled";
    mealPlan.stoppedAt = stopTimestamp;
    mealPlan.endDate = stopDate;
    mealPlan.updatedAt = stopTimestamp;

    await mealPlan.save();

    const populatedPlan = await populateMealPlanQuery(
      MealPlan.findById(mealPlan._id)
    );

    res.status(200).json({
      success: true,
      data: populatedPlan,
    });
  } catch (error) {
    console.error("Stop meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error stopping meal plan",
      error: error.message,
    });
  }
};

// @desc    Get daily meal status and calorie ring snapshot
// @route   GET /api/meal-plans/:id/daily-status
// @access  Private
exports.getDailyMealStatus = async (req, res) => {
  try {
    const { dayIndex, date } = req.query;
    const mealPlanQuery = MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    const mealPlan = await populateMealPlanQuery(mealPlanQuery);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    let targetDay = null;

    if (dayIndex !== undefined) {
      const index = parseInt(dayIndex, 10);
      if (Number.isNaN(index) || index < 0 || index >= mealPlan.days.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid day index",
        });
      }
      targetDay = mealPlan.days[index];
    } else if (date) {
      const requestedDate = new Date(date);
      requestedDate.setHours(0, 0, 0, 0);
      targetDay =
        mealPlan.days.find((day) => {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === requestedDate.getTime();
        }) || null;

      if (!targetDay) {
        return res.status(404).json({
          success: false,
          message: "No meals scheduled for the requested date",
        });
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDay =
        mealPlan.days.find((day) => {
          const dayDate = new Date(day.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === today.getTime();
        }) || mealPlan.days[0];
    }

    if (!targetDay) {
      return res.status(404).json({
        success: false,
        message: "Meal day not found",
      });
    }

    const defaultTarget =
      targetDay.calorieSummary?.targetCalories ||
      mealPlan.calorieRing?.targetDailyCalories ||
      mealPlan.targetNutrition?.dailyCalories ||
      0;

    await recalcDayCalorieSummary(targetDay, defaultTarget);

    const targetCalories =
      targetDay.calorieSummary?.targetCalories || defaultTarget;
    const consumedValue = targetDay.calorieSummary?.consumedCalories || 0;

    mealPlan.calorieRing = {
      targetDailyCalories: targetCalories,
      activeDate: targetDay.date,
      consumedCalories: consumedValue,
      completionPercentage:
        targetCalories > 0
          ? Math.min(100, Math.round((consumedValue / targetCalories) * 100))
          : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        date: targetDay.date,
        weekNumber: targetDay.weekNumber,
        meals: targetDay.meals,
        calorieSummary: targetDay.calorieSummary,
        adherence: mealPlan.adherence,
        calorieRing: mealPlan.calorieRing,
      },
    });
  } catch (error) {
    console.error("Get daily meal status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching daily meal status",
      error: error.message,
    });
  }
};

// @desc    Get current active meal plan
// @route   GET /api/meal-plans/current
// @access  Private
exports.getCurrentMealPlan = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mealPlanQuery = MealPlan.findOne({
      user: req.user.id,
      status: "active",
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    const mealPlan = await populateMealPlanQuery(mealPlanQuery);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "No active meal plan found",
      });
    }

    res.status(200).json({
      success: true,
      data: mealPlan,
    });
  } catch (error) {
    console.error("Get current meal plan error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching current meal plan",
      error: error.message,
    });
  }
};

// @desc    Get nutrition summary for meal plan
// @route   GET /api/meal-plans/:id/nutrition
// @access  Private
exports.getMealPlanNutrition = async (req, res) => {
  try {
    const mealPlanQuery = MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    const mealPlan = await populateMealPlanQuery(mealPlanQuery);

    if (!mealPlan) {
      return res.status(404).json({
        success: false,
        message: "Meal plan not found",
      });
    }

    // Calculate daily nutrition
    const dailyNutrition = mealPlan.days.map((day) => {
      let dayTotal = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
      };

      // Collect all meals for the day (declarative: functional approach)
      const dayMeals = [
        {
          meal: day.meals.breakfast.meal,
          servings: day.meals.breakfast.servings,
        },
        { meal: day.meals.lunch.meal, servings: day.meals.lunch.servings },
        { meal: day.meals.dinner.meal, servings: day.meals.dinner.servings },
        ...day.meals.snacks.map((snack) => ({
          meal: snack.meal,
          servings: snack.servings,
        })),
      ].filter((item) => item.meal); // Filter out null meals

      // Calculate total nutrition using service (declarative: service call)
      const dayNutrition = nutritionService.calculateTotalNutrition(dayMeals);
      dayTotal = dayNutrition;

      return {
        date: day.date,
        nutrition: dayTotal,
        target: mealPlan.targetNutrition,
      };
    });

    // Calculate averages using service (declarative: service call)
    const averages = nutritionService.calculateAverageNutrition(dailyNutrition);

    res.status(200).json({
      success: true,
      data: {
        dailyNutrition,
        averages,
        target: mealPlan.targetNutrition,
      },
    });
  } catch (error) {
    console.error("Get meal plan nutrition error:", error);
    return sendError(
      res,
      500,
      "Server error calculating nutrition",
      error.message
    );
  }
};

// @desc    Create manual meal plan
// @route   POST /api/v1/meal-plans
// @access  Private
exports.createMealPlan = async (req, res) => {
  try {
    const { name, startDate, duration, days, targetNutrition } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    if (!startDate || !duration || !days || !targetNutrition) {
      return sendError(
        res,
        400,
        "Please provide startDate, duration, days, and targetNutrition"
      );
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const normalizedTargetNutrition = {
      dailyCalories:
        targetNutrition.dailyCalories !== undefined
          ? Number(targetNutrition.dailyCalories)
          : Number(targetNutrition.calories),
      protein:
        targetNutrition.protein !== undefined &&
        targetNutrition.protein !== null
          ? Number(targetNutrition.protein)
          : undefined,
      carbohydrates:
        targetNutrition.carbohydrates !== undefined &&
        targetNutrition.carbohydrates !== null
          ? Number(targetNutrition.carbohydrates)
          : undefined,
      fats:
        targetNutrition.fats !== undefined && targetNutrition.fats !== null
          ? Number(targetNutrition.fats)
          : undefined,
    };

    if (Number.isNaN(normalizedTargetNutrition.dailyCalories)) {
      return sendError(
        res,
        400,
        "targetNutrition.dailyCalories (or calories) must be provided as a number"
      );
    }

    const normalizeMealEntry = (entry, mealType) => {
      if (!entry) {
        throw new Error(`Missing ${mealType} entry in meal plan day`);
      }

      if (typeof entry === "string") {
        return {
          meal: entry,
          servings: 1,
          consumed: false,
        };
      }

      if (!entry.meal) {
        throw new Error(`${mealType} entry must include a meal id`);
      }

      return {
        meal: entry.meal,
        servings: entry.servings || 1,
        consumed: entry.consumed || false,
        consumedAt: entry.consumedAt,
      };
    };

    let normalizedDays;
    try {
      normalizedDays = days.map((day, index) => {
        if (!day.meals) {
          throw new Error(`Day ${index + 1} is missing meals`);
        }

        const date = day.date
          ? new Date(day.date)
          : new Date(start.getTime() + index * 24 * 60 * 60 * 1000);

        if (isNaN(date.getTime())) {
          throw new Error(`Day ${index + 1} has an invalid date`);
        }

        const snacks = Array.isArray(day.meals.snacks)
          ? day.meals.snacks.map((snack) => normalizeMealEntry(snack, "snack"))
          : [];

        return {
          date,
          weekNumber: Math.floor(index / 7) + 1,
          meals: {
            breakfast: normalizeMealEntry(day.meals.breakfast, "breakfast"),
            lunch: normalizeMealEntry(day.meals.lunch, "lunch"),
            dinner: normalizeMealEntry(day.meals.dinner, "dinner"),
            snacks,
          },
          notes: day.notes,
          calorieSummary: {
            targetCalories: normalizedTargetNutrition.dailyCalories,
            consumedCalories: 0,
          },
        };
      });
    } catch (normalizationError) {
      return sendError(res, 400, normalizationError.message);
    }

    const planDuration = normalizedDays.length;
    const end = new Date(start);
    end.setDate(end.getDate() + planDuration - 1);

    // Calculate total meals for adherence
    let totalMeals = 0;
    normalizedDays.forEach((day) => {
      totalMeals += 3; // breakfast, lunch, dinner
      totalMeals += day.meals.snacks.length;
    });

    const extractUniqueMeals = (weekDays, mealType) => {
      const unique = [];
      weekDays.forEach((day) => {
        if (!day || !day.meals) return;

        if (mealType === "snack") {
          (day.meals.snacks || []).forEach((snack) => {
            if (snack.meal && !unique.includes(snack.meal.toString())) {
              unique.push(snack.meal.toString());
            }
          });
        } else {
          const entry = day.meals[mealType];
          if (entry && entry.meal && !unique.includes(entry.meal.toString())) {
            unique.push(entry.meal.toString());
          }
        }
      });
      return unique.slice(0, MIN_WEEKLY_OPTIONS);
    };

    const totalWeeks = Math.ceil(planDuration / 7);
    const weeklyMealOptions = [];
    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const weekDays = normalizedDays.slice(weekIndex * 7, weekIndex * 7 + 7);
      weeklyMealOptions.push({
        weekNumber: weekIndex + 1,
        breakfastOptions: extractUniqueMeals(weekDays, "breakfast"),
        lunchOptions: extractUniqueMeals(weekDays, "lunch"),
        dinnerOptions: extractUniqueMeals(weekDays, "dinner"),
        snackOptions: extractUniqueMeals(weekDays, "snack"),
      });
    }

    const mealPlan = await MealPlan.create({
      user: user._id,
      name: name || `Meal Plan - ${new Date().toLocaleDateString()}`,
      startDate: start,
      endDate: end,
      duration: planDuration,
      days: normalizedDays,
      weeklyMealOptions,
      targetNutrition: normalizedTargetNutrition,
      status: "active",
      generatedBy: "manual",
      adherence: {
        totalMeals,
        consumedMeals: 0,
        adherencePercentage: 0,
      },
      calorieRing: {
        targetDailyCalories: normalizedTargetNutrition.dailyCalories,
        activeDate: normalizedDays[0]?.date || start,
        consumedCalories: 0,
        completionPercentage: 0,
      },
    });

    const populatedPlan = await populateMealPlanQuery(
      MealPlan.findById(mealPlan._id)
    );

    return sendSuccess(res, 201, populatedPlan);
  } catch (error) {
    console.error("Create meal plan error:", error);
    return sendError(
      res,
      500,
      "Server error creating meal plan",
      error.message
    );
  }
};

// @desc    Delete meal plan
// @route   DELETE /api/v1/meal-plans/:id
// @access  Private
exports.deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!mealPlan) {
      return sendError(res, 404, "Meal plan not found");
    }

    await mealPlan.deleteOne();

    return sendSuccess(res, 200, null, "Meal plan deleted successfully");
  } catch (error) {
    console.error("Delete meal plan error:", error);
    return sendError(
      res,
      500,
      "Server error deleting meal plan",
      error.message
    );
  }
};

// @desc    Get adherence progress for plan
// @route   GET /api/v1/meal-plans/progress/:id
// @access  Private
exports.getMealPlanProgress = async (req, res) => {
  try {
    // This returns the meal plan with adherence data
    return exports.getMealPlan(req, res);
  } catch (error) {
    console.error("Get meal plan progress error:", error);
    return sendError(
      res,
      500,
      "Server error fetching meal plan progress",
      error.message
    );
  }
};

// @desc    Get weekly nutrition summary
// @route   GET /api/v1/meal-plans/summary/:id
// @access  Private
exports.getMealPlanSummary = async (req, res) => {
  try {
    // This is the same as getMealPlanNutrition
    return exports.getMealPlanNutrition(req, res);
  } catch (error) {
    console.error("Get meal plan summary error:", error);
    return sendError(
      res,
      500,
      "Server error fetching meal plan summary",
      error.message
    );
  }
};

// @desc    Get adherence analytics (streaks, meal type breakdown, weekly stats)
// @route   GET /api/v1/meal-plans/adherence-analytics
// @access  Private
exports.getAdherenceAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    // Get all meal plans within date range
    const mealPlans = await MealPlan.find({
      user: req.user.id,
      status: { $in: ["active", "completed"] },
      startDate: { $gte: startDate },
    }).sort({ startDate: 1 });

    if (mealPlans.length === 0) {
      return sendSuccess(res, 200, {
        hasData: false,
        message: "No meal plan data available in this time period",
      });
    }

    // Collect all days from all meal plans
    const allDays = [];
    mealPlans.forEach((plan) => {
      plan.days.forEach((day) => {
        allDays.push({
          date: day.date,
          meals: day.meals,
          planName: plan.name,
        });
      });
    });

    // Sort by date
    allDays.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate daily adherence for each day
    const dailyAdherence = allDays.map((day) => {
      const totalMeals = 3 + (day.meals.snacks?.length || 0); // breakfast, lunch, dinner + snacks
      let consumedMeals = 0;

      if (day.meals.breakfast?.consumed) consumedMeals++;
      if (day.meals.lunch?.consumed) consumedMeals++;
      if (day.meals.dinner?.consumed) consumedMeals++;
      (day.meals.snacks || []).forEach((snack) => {
        if (snack.consumed) consumedMeals++;
      });

      const adherencePercentage =
        totalMeals > 0 ? (consumedMeals / totalMeals) * 100 : 0;

      return {
        date: day.date,
        totalMeals,
        consumedMeals,
        adherencePercentage: Math.round(adherencePercentage),
        meetsThreshold: adherencePercentage >= 70, // 70% fixed threshold
      };
    });

    // Calculate current streak (consecutive days with ≥70% adherence)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Iterate from most recent to oldest for current streak
    for (let i = dailyAdherence.length - 1; i >= 0; i--) {
      const day = dailyAdherence[i];
      const dayDate = new Date(day.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only count toward current streak if it's today or earlier
      if (dayDate <= today) {
        if (day.meetsThreshold) {
          if (i === dailyAdherence.length - 1) {
            currentStreak++; // Start counting current streak
          }
          tempStreak++;
        } else {
          if (i === dailyAdherence.length - 1) {
            currentStreak = 0; // Broken today
          }
          break; // Stop counting current streak
        }
      }
    }

    // Calculate longest streak
    tempStreak = 0;
    dailyAdherence.forEach((day) => {
      if (day.meetsThreshold) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    // Calculate meal type breakdown
    const mealTypeStats = {
      breakfast: { total: 0, consumed: 0, percentage: 0 },
      lunch: { total: 0, consumed: 0, percentage: 0 },
      dinner: { total: 0, consumed: 0, percentage: 0 },
      snacks: { total: 0, consumed: 0, percentage: 0 },
    };

    allDays.forEach((day) => {
      // Breakfast
      mealTypeStats.breakfast.total++;
      if (day.meals.breakfast?.consumed) mealTypeStats.breakfast.consumed++;

      // Lunch
      mealTypeStats.lunch.total++;
      if (day.meals.lunch?.consumed) mealTypeStats.lunch.consumed++;

      // Dinner
      mealTypeStats.dinner.total++;
      if (day.meals.dinner?.consumed) mealTypeStats.dinner.consumed++;

      // Snacks
      const snackCount = day.meals.snacks?.length || 0;
      mealTypeStats.snacks.total += snackCount;
      (day.meals.snacks || []).forEach((snack) => {
        if (snack.consumed) mealTypeStats.snacks.consumed++;
      });
    });

    // Calculate percentages
    Object.keys(mealTypeStats).forEach((type) => {
      const stats = mealTypeStats[type];
      stats.percentage =
        stats.total > 0 ? Math.round((stats.consumed / stats.total) * 100) : 0;
    });

    // Calculate weekly adherence (group by week)
    const weeklyAdherence = [];
    let weekStart = null;
    let weekDays = [];

    dailyAdherence.forEach((day, index) => {
      const dayDate = new Date(day.date);
      const dayOfWeek = dayDate.getDay(); // 0 = Sunday

      // Start new week on Sunday or first day
      if (weekStart === null || dayOfWeek === 0) {
        if (weekDays.length > 0) {
          // Save previous week
          const avgAdherence =
            weekDays.reduce((sum, d) => sum + d.adherencePercentage, 0) /
            weekDays.length;
          weeklyAdherence.push({
            weekStart: weekStart,
            weekEnd: weekDays[weekDays.length - 1].date,
            avgAdherence: Math.round(avgAdherence),
            daysCount: weekDays.length,
          });
        }
        weekStart = day.date;
        weekDays = [day];
      } else {
        weekDays.push(day);
      }

      // Handle last week
      if (index === dailyAdherence.length - 1 && weekDays.length > 0) {
        const avgAdherence =
          weekDays.reduce((sum, d) => sum + d.adherencePercentage, 0) /
          weekDays.length;
        weeklyAdherence.push({
          weekStart: weekStart,
          weekEnd: day.date,
          avgAdherence: Math.round(avgAdherence),
          daysCount: weekDays.length,
        });
      }
    });

    // Find best and worst days of week
    const dayOfWeekStats = Array(7)
      .fill(null)
      .map(() => ({
        count: 0,
        totalAdherence: 0,
        avgAdherence: 0,
      }));

    dailyAdherence.forEach((day) => {
      const dayOfWeek = new Date(day.date).getDay();
      dayOfWeekStats[dayOfWeek].count++;
      dayOfWeekStats[dayOfWeek].totalAdherence += day.adherencePercentage;
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeekBreakdown = dayOfWeekStats
      .map((stats, index) => ({
        day: dayNames[index],
        avgAdherence:
          stats.count > 0 ? Math.round(stats.totalAdherence / stats.count) : 0,
        count: stats.count,
      }))
      .filter((d) => d.count > 0); // Only include days with data

    // Sort to find best and worst
    const sortedDays = [...dayOfWeekBreakdown].sort(
      (a, b) => b.avgAdherence - a.avgAdherence
    );
    const bestDay = sortedDays[0] || null;
    const worstDay = sortedDays[sortedDays.length - 1] || null;

    // Calculate overall stats
    const overallAdherence =
      dailyAdherence.length > 0
        ? Math.round(
            dailyAdherence.reduce((sum, d) => sum + d.adherencePercentage, 0) /
              dailyAdherence.length
          )
        : 0;

    const analytics = {
      hasData: true,
      summary: {
        overallAdherence,
        totalDays: dailyAdherence.length,
        daysAboveThreshold: dailyAdherence.filter((d) => d.meetsThreshold)
          .length,
        currentStreak,
        longestStreak,
      },
      streaks: {
        current: currentStreak,
        longest: longestStreak,
        threshold: 70,
        message:
          currentStreak > 0
            ? `🔥 ${currentStreak}-day streak! Keep it up!`
            : "Start a new streak by maintaining 70%+ adherence!",
      },
      mealTypeBreakdown: mealTypeStats,
      weeklyAdherence,
      dayOfWeekBreakdown,
      patterns: {
        bestDay: bestDay ? `${bestDay.day} (${bestDay.avgAdherence}%)` : "N/A",
        worstDay: worstDay
          ? `${worstDay.day} (${worstDay.avgAdherence}%)`
          : "N/A",
        insight:
          bestDay && worstDay
            ? `You're most consistent on ${bestDay.day}s and struggle on ${worstDay.day}s.`
            : "Keep tracking to identify patterns!",
      },
      dailyData: dailyAdherence, // For calendar heatmap
    };

    return sendSuccess(res, 200, analytics);
  } catch (error) {
    console.error("Get adherence analytics error:", error);
    return sendError(
      res,
      500,
      "Server error calculating adherence analytics",
      error.message
    );
  }
};
