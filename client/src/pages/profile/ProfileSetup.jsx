import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ProfileSetup = () => {
  const { user, updateProfile, isProfileComplete, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    healthGoal: "maintain",
    activityLevel: "moderate",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        age: user.age || "",
        gender: user.gender || "",
        height: user.height || "",
        currentWeight: user.currentWeight || "",
        targetWeight: user.targetWeight || "",
        healthGoal: user.healthGoal || "maintain",
        activityLevel: user.activityLevel || "moderate",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!loading && isProfileComplete) {
      navigate("/user-dashboard");
    }
  }, [isProfileComplete, loading, navigate]);

  if (loading) return <LoadingSpinner />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const processed = {
      ...formData,
      age: Number(formData.age),
      height: Number(formData.height),
      currentWeight: Number(formData.currentWeight),
      targetWeight: Number(formData.targetWeight),
    };

    await updateProfile(processed);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Age"
            required
          />
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Height (cm)"
            required
          />
          <input
            type="number"
            name="currentWeight"
            value={formData.currentWeight}
            onChange={handleChange}
            placeholder="Current Weight (kg)"
            required
          />
          <input
            type="number"
            name="targetWeight"
            value={formData.targetWeight}
            onChange={handleChange}
            placeholder="Target Weight (kg)"
            required
          />
          <select
            name="healthGoal"
            value={formData.healthGoal}
            onChange={handleChange}
            required
          >
            <option value="lose">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain">Gain Weight</option>
          </select>
          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
            required
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very Active</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
