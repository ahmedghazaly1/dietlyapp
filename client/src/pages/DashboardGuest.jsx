// src/pages/DashboardGuest.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import CircularProgress from "../components/landing/CircularProgress";
import FeatureCard from "../components/landing/FeatureCard";
import {
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Award,
  Stethoscope,
  Microscope,
  CheckCircle,
  Shield,
  Calculator,
  Scale,
  Heart,
  ChefHat,
  BookOpen,
  Utensils,
} from "lucide-react";

const DashboardGuest = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [bmiData, setBmiData] = useState({
    weight: "",
    height: "",
    bmi: null,
    category: "",
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const calculateBMI = () => {
    const weight = parseFloat(bmiData.weight);
    const height = parseFloat(bmiData.height) / 100; // Convert cm to meters

    if (weight && height) {
      const bmi = weight / (height * height);
      let category = "";

      if (bmi < 18.5) category = "Underweight";
      else if (bmi < 25) category = "Normal weight";
      else if (bmi < 30) category = "Overweight";
      else category = "Obese";

      setBmiData({
        ...bmiData,
        bmi: bmi.toFixed(1),
        category,
      });
    }
  };

  const resetBMI = () => {
    setBmiData({
      weight: "",
      height: "",
      bmi: null,
      category: "",
    });
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return "text-gray-500";
    if (bmi < 18.5) return "text-blue-500";
    if (bmi < 25) return "text-green-500";
    if (bmi < 30) return "text-orange-500";
    return "text-red-500";
  };

  const getBMIBarColor = (bmi) => {
    if (!bmi) return "bg-gray-200";
    if (bmi < 18.5) return "bg-blue-500";
    if (bmi < 25) return "bg-green-500";
    if (bmi < 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getBMIPosition = (bmi) => {
    const min = 10; // safety lower bound
    const max = 40; // safety upper bound

    const clamped = Math.min(Math.max(bmi, min), max);

    // Total visual bar is divided into 4 equal segments
    const segmentWidth = 25; // (100% / 4)

    if (clamped < 18.5) {
      return (clamped / 18.5) * segmentWidth + "%";
    }

    if (clamped < 25) {
      return (
        segmentWidth + ((clamped - 18.5) / (25 - 18.5)) * segmentWidth + "%"
      );
    }

    if (clamped < 30) {
      return (
        2 * segmentWidth + ((clamped - 25) / (30 - 25)) * segmentWidth + "%"
      );
    }

    return (
      3 * segmentWidth + ((clamped - 30) / (max - 30)) * segmentWidth + "%"
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="absolute left-0 top-40 w-96 h-96 bg-green-200 rounded-full blur-[120px] opacity-40" />
      <div className="absolute right-0 top-20 w-96 h-96 bg-lime-300 rounded-full blur-[130px] opacity-30" />

      {/* ==================== NAVIGATION ==================== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#246608]/95 backdrop-blur-xl border-b border-white/[0.05]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Button
                onClick={() => navigate("/meals")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Browse Meals
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="space-y-8 text-center">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full mx-auto">
                <Sparkles className="w-4 h-4 text-[#246608]" />
                <span className="text-xs font-semibold text-[#246608] tracking-widest">
                  AI-POWERED NUTRITION
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                THE SMARTER PATH
                <br />
                TO YOUR
                <br />
                TARGET WEIGHT
              </h1>

              {/* Sub-headline */}
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
                Dietly AI uses advanced insights to craft perfectly personalized
                nutrition plans that evolve with you.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#246608]/10 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6 text-[#246608]" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Personalized Plans
                  </h3>
                  <p className="text-sm text-gray-600">
                    AI-generated meal plans tailored to your goals
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#246608]/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6 text-[#246608]" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Expert Guidance
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nutritionist-approved recipes and tips
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-12 h-12 bg-[#246608]/10 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6 text-[#246608]" />
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    Proven Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Thousands of success stories
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-4 flex-wrap pt-8">
                <Button
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="px-8 py-6 bg-[#246608] hover:bg-[#1a4a06] transition-all duration-300 text-base font-semibold"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  START YOUR JOURNEY
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 bg-transparent border-2 border-[#246608]/20 hover:bg-[#246608]/10 transition-all duration-300 text-base font-semibold text-[#246608]"
                  onClick={() => {
                    const section = document.getElementById("how");
                    if (section) {
                      const yOffset = -120;
                      const y =
                        section.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                >
                  HOW IT WORKS
                </Button>

                <Button
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-[#246608] to-[#2F7A0A] hover:from-[#1a4a06] hover:to-[#246608] transition-all duration-300 text-base font-semibold text-white"
                  onClick={() => {
                    const section = document.getElementById("bmi-calculator");
                    if (section) {
                      const yOffset = -80;
                      const y =
                        section.getBoundingClientRect().top +
                        window.pageYOffset +
                        yOffset;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  FREE BMI CALCULATOR
                </Button>
              </div>

              {/* Trust Indicator */}
              <div className="pt-8">
                <p className="text-sm text-gray-500">
                  Trusted by 10,000+ users • 4.9/5 rating • Nutritionist
                  approved
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF BAR ==================== */}
      <section className="relative py-12 border-y border-[#246608]/20">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            {/* Users */}
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-[#246608]/80 border-2 border-white flex items-center justify-center"
                  >
                    <Users className="w-5 h-5 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                10K+ Active Users
              </span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-[#246608]/20"></div>

            {/* Rating */}
            <div className="flex items-center space-x-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                4.9 Rating
              </span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-[#246608]/20"></div>

            {/* Personalized */}
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#246608]" />
              <span className="text-sm text-gray-600 font-medium">
                Fully Personalized
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BMI CALCULATOR SECTION ==================== */}
      <section id="bmi-calculator" className="relative py-20 bg-[#F6F9F6]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Calculator */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full">
                  <Calculator className="w-4 h-4 text-[#246608]" />
                  <span className="text-xs font-semibold text-[#246608] tracking-widest">
                    FREE HEALTH TOOL
                  </span>
                </div>

                <h2 className="text-4xl font-bold text-gray-800">
                  Check Your BMI
                </h2>
                <p className="text-lg text-gray-600">
                  Calculate your Body Mass Index and get personalized insights
                  about your health status.
                </p>
              </div>

              <div className="space-y-6 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={bmiData.weight}
                      onChange={(e) =>
                        setBmiData({ ...bmiData, weight: e.target.value })
                      }
                      placeholder="70"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={bmiData.height}
                      onChange={(e) =>
                        setBmiData({ ...bmiData, height: e.target.value })
                      }
                      placeholder="175"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#246608] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={calculateBMI}
                    className="flex-1 bg-[#246608] hover:bg-[#1a4a06]"
                    disabled={!bmiData.weight || !bmiData.height}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Calculate BMI
                  </Button>
                  <Button
                    onClick={resetBMI}
                    variant="outline"
                    className="border-[#246608] text-[#246608] hover:bg-[#246608]/10"
                  >
                    Reset
                  </Button>
                </div>

                {/* BMI Result */}
                {bmiData.bmi && (
                  <div className="space-y-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        Your BMI:{" "}
                        <span className={getBMIColor(bmiData.bmi)}>
                          {bmiData.bmi}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-gray-600 mt-2">
                        {bmiData.category}
                      </div>
                    </div>

                    {/* BMI Scale Visualization */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Underweight</span>
                        <span>Normal</span>
                        <span>Overweight</span>
                        <span>Obese</span>
                      </div>
                      <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div className="flex-1 bg-blue-400"></div>
                          <div className="flex-1 bg-green-400"></div>
                          <div className="flex-1 bg-orange-400"></div>
                          <div className="flex-1 bg-red-400"></div>
                        </div>
                        <div
                          className={`absolute top-0 w-2 h-4 ${getBMIBarColor(
                            bmiData.bmi
                          )} rounded-full -ml-1`}
                          style={{ left: getBMIPosition(bmiData.bmi) }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{"<18.5"}</span>
                        <span>18.5-25</span>
                        <span>25-30</span>
                        <span>{">30"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - BMI Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#246608] to-[#2F7A0A] rounded-2xl p-8 text-white">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold">What is BMI?</h3>
                  <p className="text-white/90 leading-relaxed">
                    Body Mass Index (BMI) is a simple calculation using a
                    person's height and weight. It's a useful screening tool to
                    identify potential weight problems for adults.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-yellow-300" />
                      <span>Helps assess health risks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-yellow-300" />
                      <span>Simple and quick calculation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-yellow-300" />
                      <span>Track your progress over time</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-white/80">
                      For personalized meal plans and detailed health tracking,
                      create your free account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MEAL LIBRARY ADVERTISEMENT ==================== */}
      <section className="relative py-20 bg-gradient-to-br from-[#246608] to-[#2F7A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <ChefHat className="w-4 h-4" />
                  <span className="text-sm font-semibold tracking-widest">
                    EXPLORE OUR COLLECTION
                  </span>
                </div>

                <h2 className="text-5xl font-bold leading-tight">
                  Discover Our
                  <br />
                  <span className="text-yellow-300">400+ Meal</span>
                  <br />
                  Recipe Library
                </h2>

                <p className="text-lg text-white/90 leading-relaxed">
                  From quick weekday dinners to gourmet diet recipes, find
                  perfect meals for every occasion. All nutritionist-approved
                  and calorie-controlled for your goals.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Regular & Diet Options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>AI-Personalized</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Quick & Easy Recipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-yellow-300" />
                    <span>Nutritionist Approved</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => navigate("/meals")}
                  size="lg"
                  className="px-8 py-6 bg-white text-[#246608] hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 font-bold"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  BROWSE MEAL LIBRARY
                </Button>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {/* Meal preview cards */}
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="w-full h-24 bg-white/10 rounded mb-3 flex items-center justify-center">
                        <Utensils className="w-8 h-8 text-white/60" />
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-white">
                          Premium Meal #{item}
                        </div>
                        <div className="text-xs text-white/60">350-550 cal</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-300">400+</div>
                  <div className="text-white/80">Recipes Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUCCESS STORIES ==================== */}
      <section className="relative py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="bg-gradient-to-br from-[#246608] to-[#2F7A0A] rounded-2xl p-8 text-white">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-300 mb-2">
                  1000+
                </div>
                <div className="text-2xl font-semibold">Success Stories</div>
                <p className="text-white/80 mt-2">Real people, real results</p>
              </div>

              {/* Success Story Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-[#246608] font-bold">S</span>
                    </div>
                    <div>
                      <div className="font-semibold">Sarah M.</div>
                      <div className="text-white/70 text-sm">
                        Lost 15kg in 3 months
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm italic">
                    "The personalized meal plans made weight loss so much
                    easier. I never felt deprived!"
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-[#246608] font-bold">J</span>
                    </div>
                    <div>
                      <div className="font-semibold">James T.</div>
                      <div className="text-white/70 text-sm">
                        Gained 8kg muscle
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm italic">
                    "Finally found a meal plan that actually helped me build
                    muscle without guesswork."
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center">
                      <span className="text-[#246608] font-bold">M</span>
                    </div>
                    <div>
                      <div className="font-semibold">Maria L.</div>
                      <div className="text-white/70 text-sm">
                        Maintained for 1+ year
                      </div>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm italic">
                    "The ongoing support and recipe variety helped me maintain
                    my goal weight effortlessly."
                  </p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-white/20">
                <p className="text-sm text-white/80">
                  Join our community of success stories today
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how" className="relative py-24 bg-[#F6F9F6]">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-poppins text-[#246608]">
              How does it work?
            </h2>
            <p className="text-lg text-gray-600 font-poppins">
              Follow these simple steps to achieve your health goals
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
            <FeatureCard
              number="1"
              title="Register & Complete Profile"
              description="Sign up and provide your goals, dietary preferences, and body measurements."
            />
            <FeatureCard
              number="2"
              title="Generate Your First Plan"
              description="Let the AI create a personalized weekly meal plan tailored to your needs."
            />
            <FeatureCard
              number="3"
              title="Track Your Progress"
              description="Check in regularly, add progress entries, and monitor your improvements over time."
            />
            <FeatureCard
              number="4"
              title="Explore & Succeed"
              description="Discover meals from our 500+ meal library and achieve your health goals."
              isLast
            />
          </div>
        </div>
      </section>

      {/* ==================== EXPERTISE ==================== */}
      <section id="expertise" className="relative py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8">Built on Expertise</h2>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
              <span className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-[#246608]" />
                <span className="text-sm font-medium">
                  Certified Nutritionists
                </span>
              </span>

              <span className="text-gray-400">•</span>

              <span className="flex items-center space-x-2">
                <Microscope className="w-6 h-6 text-[#246608]" />
                <span className="text-sm font-medium">AI Research Lab</span>
              </span>

              <span className="text-gray-400">•</span>

              <span className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-[#246608]" />
                <span className="text-sm font-medium">Clinical Validation</span>
              </span>

              <span className="text-gray-400">•</span>

              <span className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-[#246608]" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 bg-[#F6F9F6]">
        <div className="max-w-[800px] mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform
            <br />
            Your Health?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands who've discovered the smarter path to sustainable
            nutrition with Dietly AI.
          </p>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="px-12 py-7 bg-[#246608] hover:bg-[#1a4a06] transition-all duration-300 text-lg font-bold"
          >
            <TrendingUp className="w-6 h-6 mr-2" />
            GET STARTED FREE
          </Button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-[#246608]/20 py-10">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">
              © 2024 Dietly AI. All rights reserved.
            </p>

            <div className="flex gap-8 text-sm text-gray-500">
              <button className="hover:text-[#246608] transition-colors">
                Privacy
              </button>
              <button className="hover:text-[#246608] transition-colors">
                Terms
              </button>
              <button className="hover:text-[#246608] transition-colors">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardGuest;
