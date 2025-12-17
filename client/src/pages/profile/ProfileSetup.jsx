import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Button } from "../../components/ui/button";

const ProfileSetup = () => {
  const { user, updateProfile, finalizeRegistration, loading, clearJustRegistered } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedActivityLevel, setSelectedActivityLevel] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("Egypt");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [currentWeightKg, setCurrentWeightKg] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [heightUnit, setHeightUnit] = useState("metric");
  const [weightUnit, setWeightUnit] = useState("metric");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);

  useEffect(() => {
    if (user) {
      clearJustRegistered();
    }
  }, [clearJustRegistered, user]);

  useEffect(() => {
    if (currentStep === 7 && !weeklyGoal && selectedGoal) {
      if (selectedGoal === "lose" || selectedGoal === "gain") {
        setWeeklyGoal("0.25");
      } else {
        setWeeklyGoal("0");
      }
    }
  }, [currentStep, selectedGoal, weeklyGoal]);

  if (loading) return <LoadingSpinner />;

  const goals = [
    { id: "lose", label: "Lose weight", value: "lose" },
    { id: "maintain", label: "Maintain weight", value: "maintain" },
    { id: "gain", label: "Gain weight", value: "gain" },
  ];

  const activityLevels = [
    {
      id: "sedentary",
      label: "Not Very Active",
      description: "Spend most of the day sitting (e.g., bankteller, desk job)",
      value: "sedentary",
    },
    {
      id: "light",
      label: "Lightly Active",
      description: "Spend a good part of the day on your feet (e.g., teacher, salesperson)",
      value: "light",
    },
    {
      id: "active",
      label: "Active",
      description: "Spend a good part of the day doing some physical activity (e.g., food server, postal carrier)",
      value: "active",
    },
    {
      id: "very_active",
      label: "Very Active",
      description: "Spend a good part of the day doing heavy physical activity (e.g., bike messenger, carpenter)",
      value: "very_active",
    },
  ];

  const dietOptions = [
    "vegetarian",
    "vegan",
    "pescatarian",
    "keto",
    "paleo",
    "low-carb",
    "high-protein",
    "gluten-free",
    "dairy-free",
  ];

  const allergyOptions = [
    "nuts",
    "peanuts",
    "dairy",
    "eggs",
    "gluten",
    "soy",
    "fish",
    "shellfish",
    "wheat",
  ];

  const toggleDiet = (value) => {
    setDietaryPreferences((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleAllergy = (value) => {
    setAllergies((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleGoalSelect = (goalValue) => {
    setSelectedGoal(goalValue);
    if (goalValue === "maintain") {
      setWeeklyGoal("");
    }
  };

  const handleActivityLevelSelect = (activityValue) => {
    setSelectedActivityLevel(activityValue);
  };

  // Convert feet and inches to cm
  const feetInchesToCm = (feet, inches) => {
    const totalInches = parseFloat(feet) * 12 + parseFloat(inches);
    return totalInches * 2.54;
  };

  // Convert lbs to kg
  const lbsToKg = (lbs) => {
    return parseFloat(lbs) * 0.453592;
  };

  // Convert cm to feet and inches
  const cmToFeetInches = (cm) => {
    const totalInches = parseFloat(cm) / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return { feet, inches };
  };

  // Convert kg to lbs
  const kgToLbs = (kg) => {
    return parseFloat(kg) * 2.20462;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Step 1: Goals selection
      if (!selectedGoal) {
        return;
      }
      setIsSubmitting(true);
      if (user) {
        const profileData = { healthGoal: selectedGoal };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(2);
      if (selectedGoal === "maintain") {
        setWeeklyGoal("");
      }
    } else if (currentStep === 2) {
      // Step 2: Activity level selection
      if (!selectedActivityLevel) {
        return;
      }
      setIsSubmitting(true);
      if (user) {
        const profileData = { activityLevel: selectedActivityLevel };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setIsSubmitting(true);
      if (user) {
        const profileData = { dietaryPreferences };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setIsSubmitting(true);
      if (user) {
        const profileData = { allergies };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Step 3: Personal information
      if (!selectedGender || !age) {
        return;
      }

      const ageNumber = parseInt(age);

      // Validate age is reasonable
      if (isNaN(ageNumber) || ageNumber < 13 || ageNumber > 120) {
        alert("Please enter a valid age between 13 and 120");
        return;
      }

      setIsSubmitting(true);
      if (user) {
        const profileData = { gender: selectedGender, age: ageNumber };
        await updateProfile(profileData);
      }
      setIsSubmitting(false);
      setCurrentStep(6);
    } else if (currentStep === 6) {
      // Step 4: Height and weight
      
      // Validate weight inputs (kg only)
      if (!currentWeightKg || !targetWeightKg || parseFloat(currentWeightKg) <= 0 || parseFloat(targetWeightKg) <= 0) {
        alert("Please enter valid weight values in kilograms");
        return;
      }
      
      // Validate height input (cm only)
      if (!heightCm || parseFloat(heightCm) <= 0) {
        alert("Please enter a valid height in centimeters");
        return;
      }
      
      // Convert height to cm
      const heightInCm = parseFloat(heightCm);

      // Weight already in kg
      const currentWeightKgValue = parseFloat(currentWeightKg);
      const targetWeightKgValue = parseFloat(targetWeightKg);

      const ageNumber = parseInt(age);
      
      setIsSubmitting(true);
      
      // Send ALL required fields together - backend will calculate dailyCalorieTarget
      const profileData = {
        height: Math.round(heightInCm),
        currentWeight: Math.round(currentWeightKgValue * 10) / 10,
        targetWeight: Math.round(targetWeightKgValue * 10) / 10,
        age: ageNumber,
        gender: selectedGender,
        healthGoal: selectedGoal,
        activityLevel: selectedActivityLevel,
      };
      
      console.log('Sending profile data to backend:', profileData);
      
      // For "maintain" goal, mark setup as complete after step 4
      if (selectedGoal === "maintain") {
        profileData.profileSetupComplete = true;
      }
      
      try {
        if (user) {
          await updateProfile(profileData);
          setIsSubmitting(false);
          if (selectedGoal === "maintain") {
            setTimeout(() => {
              window.location.replace("/user-dashboard");
            }, 2000);
          } else {
            setCurrentStep(7);
          }
        } else {
          if (selectedGoal === "maintain") {
            const result = await finalizeRegistration(profileData);
            setIsSubmitting(false);
            if (result.success) {
              setTimeout(() => {
                window.location.replace("/user-dashboard");
              }, 1000);
            }
          } else {
            setIsSubmitting(false);
            setCurrentStep(7);
          }
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        alert("Failed to save profile. Please try again.");
        setIsSubmitting(false);
      }
    } else if (currentStep === 7) {
      // Step 7: Weekly goal selection
      if (!weeklyGoal) {
        return;
      }
      
      setIsSubmitting(true);
      
      const ageNumber = parseInt(age);
      
      let heightInCm;
      if (heightUnit === "imperial") {
        heightInCm = feetInchesToCm(heightFeet, heightInches);
      } else {
        heightInCm = parseFloat(heightCm);
      }
      
      let currentWeightKgValue, targetWeightKgValue;
      if (weightUnit === "imperial") {
        currentWeightKgValue = lbsToKg(currentWeight);
        targetWeightKgValue = lbsToKg(targetWeight);
      } else {
        currentWeightKgValue = parseFloat(currentWeightKg);
        targetWeightKgValue = parseFloat(targetWeightKg);
      }
      
      const payload = {
        height: Math.round(heightInCm),
        currentWeight: Math.round(currentWeightKgValue * 10) / 10,
        targetWeight: Math.round(targetWeightKgValue * 10) / 10,
        age: ageNumber,
        gender: selectedGender,
        healthGoal: selectedGoal,
        activityLevel: selectedActivityLevel,
        weeklyGoal: parseFloat(weeklyGoal),
        dietaryPreferences,
        allergies,
        profileSetupComplete: true,
      };
      
      console.log('Sending final profile data to backend:', payload);
      
      try {
        if (user) {
          await updateProfile(payload);
          setIsSubmitting(false);
          setTimeout(() => {
            window.location.replace("/user-dashboard");
          }, 2000);
        } else {
          const result = await finalizeRegistration(payload);
          setIsSubmitting(false);
          if (result.success) {
            setTimeout(() => {
              window.location.replace("/user-dashboard");
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error finalizing registration:", error);
        alert("Failed to complete setup. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/register");
    } else if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      setCurrentStep(4);
    } else if (currentStep === 6) {
      setCurrentStep(5);
    } else if (currentStep === 7) {
      setCurrentStep(6);
    }
  };

  const userName = user?.name?.split(" ")[0] || "there";

  const isMaintainGoal = selectedGoal === "maintain";
  const totalSteps = isMaintainGoal ? 6 : 7;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  const getWeeklyGoalOptions = () => {
    if (selectedGoal === "lose") {
      return [
        { value: "0.25", label: "Lose 0.25 kilograms per week (Recommended)", recommended: true },
        { value: "0.5", label: "Lose 0.5 kilograms per week" },
      ];
    } else if (selectedGoal === "gain") {
      return [
        { value: "0.25", label: "Gain 0.25 kilograms per week (Recommended)", recommended: true },
        { value: "0.5", label: "Gain 0.5 kilograms per week" },
      ];
    } else {
      return [
        { value: "0", label: "Maintain current weight (Recommended)", recommended: true },
      ];
    }
  };

  const countries = [
    "Egypt",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Italy",
    "Spain",
    "Japan",
    "China",
    "India",
    "Brazil",
    "Mexico",
    "Argentina",
    "South Africa",
    "Saudi Arabia",
    "United Arab Emirates",
    "Turkey",
    "Russia",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="w-full bg-gray-200 h-2">
            <div
              className="bg-[#246608] h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="p-8">
            {/* Step 1: Goals Selection */}
            {currentStep === 1 && (
              <>
                <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">
                  Thanks {userName}! Now for your goals.
                </h1>

                <p className="text-gray-600 mb-8 text-lg text-center">
                  Select up to 3 that are important to you, including one weight goal.
                </p>

                <div className="space-y-3 mb-8">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleGoalSelect(goal.value)}
                      className={`w-full py-4 px-6 rounded-lg text-left font-medium text-gray-900 transition-all duration-200 ${
                        selectedGoal === goal.value
                          ? "bg-[#246608] text-white shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Step 2: Activity Level Selection */}
            {currentStep === 2 && (
              <>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
                  What is your baseline activity level?
                </h1>

                <p className="text-gray-500 mb-8 text-base text-center">
                  Not including workouts—we count that separately.
                </p>

                <div className="space-y-3 mb-8">
                  {activityLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleActivityLevelSelect(level.value)}
                      className={`w-full py-4 px-6 rounded-lg text-left transition-all duration-200 ${
                        selectedActivityLevel === level.value
                          ? "bg-white border-2 border-[#246608] shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                      }`}
                    >
                      <div
                        className={`font-medium mb-1 ${
                          selectedActivityLevel === level.value
                            ? "text-[#246608]"
                            : "text-gray-900"
                        }`}
                      >
                        {level.label}
                      </div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-6 mb-8">
                  <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Dietary Preferences</h1>
                  <p className="text-gray-500 mb-8 text-base text-center">Select any that apply to you.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {dietOptions.map((opt) => {
                      const active = dietaryPreferences.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleDiet(opt)}
                          className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                            active
                              ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                              : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <div className="space-y-6 mb-8">
                  <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Allergies</h1>
                  <p className="text-gray-500 mb-8 text-base text-center">Select any allergies you have.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {allergyOptions.map((opt) => {
                      const active = allergies.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleAllergy(opt)}
                          className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                            active
                              ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                              : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {currentStep === 5 && (
              <>
                <div className="space-y-6 mb-8">
                  {/* Gender Selection */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      What's your gender?
                    </h2>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedGender("male")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedGender === "male"
                            ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                            : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGender("female")}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedGender === "female"
                            ? "border-[#246608] bg-[#246608]/10 text-[#246608] font-medium"
                            : "border-gray-200 hover:border-[#246608]/60 text-gray-700"
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>

                  {/* Age Input */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      How old are you?
                    </h2>
                    <div className="relative">
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="13"
                        max="120"
                        className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                        placeholder="Enter your age"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      You must be at least 13 years old
                    </p>
                  </div>

                  {/* Country Selection */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      Where do you live?
                    </h2>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full py-3 px-4 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608] appearance-none bg-white"
                      >
                        {countries.map((countryName) => (
                          <option key={countryName} value={countryName}>
                            {countryName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    We use this information to calculate an accurate calorie goal for you.
                  </p>
                </div>
              </>
            )}

            {/* Step 6: Height and Weight */}
            {currentStep === 6 && (
              <>
                <div className="space-y-6 mb-8">
                  {/* Height Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                      How tall are you?
                    </h2>
                    <div className="relative mb-2">
                      <input
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        placeholder="Height (cm)"
                        min="0"
                        className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        cm
                      </span>
                    </div>
                  </div>

                  {/* Current Weight Section (kg only) */}
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                      How much do you weigh?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      It's OK to estimate. You can update this later.
                    </p>
                    <div className="relative mb-2">
                      <input
                        type="number"
                        value={currentWeightKg}
                        onChange={(e) => setCurrentWeightKg(e.target.value)}
                        placeholder="Current weight"
                        min="0"
                        step="0.1"
                        className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Target Weight Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                      What's your goal weight?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Don't worry. This doesn't affect your daily calorie goal and you can always change it later.
                    </p>
                    <div className="relative">
                      <input
                        type="number"
                        value={targetWeightKg}
                        onChange={(e) => setTargetWeightKg(e.target.value)}
                        placeholder="Goal weight"
                        min="0"
                        step="0.1"
                        className="w-full py-3 px-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#246608] focus:border-[#246608]"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Weekly Goal Selection */}
            {currentStep === 7 && (
              <>
                {/* Title */}
                <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">
                  What is your weekly goal?
                </h1>

                {/* Instructions */}
                <p className="text-gray-500 mb-8 text-base text-center">
                  Choose a weekly pace that feels sustainable for you. Consistency is key to long-term success.
                </p>

                {/* Weekly Goal Options */}
                <div className="space-y-3 mb-8">
                  {getWeeklyGoalOptions().map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWeeklyGoal(option.value)}
                      className={`w-full py-4 px-6 rounded-lg text-left transition-all duration-200 ${
                        weeklyGoal === option.value
                          ? "bg-white border-2 border-[#246608] shadow-md"
                          : "bg-white border-2 border-gray-200 hover:border-[#246608]/60 hover:bg-[#246608]/10"
                      }`}
                    >
                      <div
                        className={`font-medium ${
                          weeklyGoal === option.value
                            ? "text-[#246608]"
                            : "text-gray-900"
                        }`}
                      >
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-2 border-[#246608] text-[#246608] hover:bg-[#246608]/10 rounded-lg py-3 font-semibold"
              >
                BACK
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 bg-[#246608] hover:bg-[#246608]/90 text-white rounded-lg py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "NEXT"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
