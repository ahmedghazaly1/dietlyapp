import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CircularProgress from "../components/landing/CircularProgress";
import StepCircle from "../components/landing/StepCircle";
import FeatureCard from "../components/landing/FeatureCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { LogOut, Sparkles, TrendingUp, Users, Star, Award, Dna, Stethoscope, Microscope, CheckCircle, Shield } from "lucide-react";

const Dashboard = () => {
  const { user, isProfileComplete, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isGoalAchieved = user?.currentWeight === user?.targetWeight;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* ==================== NAVIGATION ==================== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0D0D]/95 backdrop-blur-xl border-b border-white/[0.05]'
          : 'bg-transparent'
      }`}>
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
  <span className="text-2xl font-bold tracking-tight">DIETLY</span>
</div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
  <Button
    onClick={() => navigate("/meals")}
    variant="ghost"
    size="sm"
    className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
  >
    Meals
  </Button>
  
  <Button
    onClick={() => navigate("/progress")}
    variant="ghost"
    size="sm"
    className="text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
  >
    Progress
  </Button>

  {/* Profile Button */}
  <Button
    onClick={() => navigate("/Profile/me")}
    variant="ghost"
    size="sm"
    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#00A3FF] hover:opacity-80 transition-opacity p-0 flex items-center justify-center"
  >
    <span className="text-white font-bold text-sm">
      {user?.name?.charAt(0).toUpperCase() || "U"}
    </span>
  </Button>
</div>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00D1FF]/10 border border-[#00D1FF]/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#00D1FF]" />
                  <span className="text-xs font-semibold text-[#00D1FF] tracking-widest">AI-POWERED NUTRITION</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                  THE SMARTER PATH<br />
                  TO YOUR<br />
                  TARGET WEIGHT
                </h1>

                {/* Sub-headline */}
                <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                  Dietly AI uses advanced insights to craft perfectly personalized nutrition plans that evolve with you.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => isProfileComplete ? navigate("/meal-plans/generate") : navigate("/profile-setup")}
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] hover:shadow-2xl hover:shadow-[#00D1FF]/30 transition-all duration-300 text-base font-semibold"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  START YOUR JOURNEY
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 bg-transparent border-2 border-white/20 hover:bg-white/5 transition-all duration-300 text-base font-semibold"
                >
                  HOW IT WORKS
                </Button>
              </div>
            </div>

            {/* Right Column - Data Visualization */}
            <div className="flex items-center justify-center">
              <Card className="bg-[#1A1A1A] border-white/[0.05] rounded-3xl shadow-2xl">
                <CardContent className="p-12">
                  <CircularProgress
                    value={`${user?.currentWeight || 80} kg`}
                    label="Current Weight"
                    isGoalAchieved={isGoalAchieved}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SOCIAL PROOF BAR ==================== */}
      <section className="relative py-12 border-y border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
            {/* Users */}
            <div className="flex items-center space-x-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#00A3FF] border-2 border-[#0D0D0D] flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium">10K+ Active Users</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-white/[0.05]"></div>

            {/* Rating */}
            <div className="flex items-center space-x-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400 font-medium">4.9 Rating</span>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-8 bg-white/[0.05]"></div>

            {/* Personalized */}
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#00D1FF]" />
              <span className="text-sm text-gray-400 font-medium">Fully Personalized</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how" className="relative py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Your Journey, Simplified</h2>
            <p className="text-lg text-gray-400">Four simple steps to transform your health</p>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative">
            <StepCircle number="1" title="Set Your Goal" />
            <StepCircle number="2" title="Get AI Plan" />
            <StepCircle number="3" title="Track & Adapt" />
            <StepCircle number="4" title="Succeed" isLast />
          </div>
        </div>
      </section>

      {/* ==================== FEATURES GRID ==================== */}
      <section id="features" className="relative py-24 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Your AI-Powered Toolkit</h2>
            <p className="text-lg text-gray-400">Everything you need to succeed</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="📅"
              title="Smart Meal Planning"
              description="AI generates personalized weekly meal plans that match your goals."
            />

            <FeatureCard
              icon="📊"
              title="Progress Analytics"
              description="Track weight, BMI, and energy levels with beautiful visualizations."
            />

            <FeatureCard
              icon="🎯"
              title="Goal Tracking"
              description="Set targets and watch AI help you achieve them with adaptive strategies."
            />

            <FeatureCard
              icon="📱"
              title="Mobile Ready"
              description="Access your personalized nutrition plan anywhere, anytime."
            />
          </div>
        </div>
      </section>

      {/* ==================== EXPERTISE ==================== */}
      <section id="expertise" className="relative py-24">
        <div className="max-w-[1200px] mx-auto px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-8">Built on Expertise</h2>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
              <span className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-[#00D1FF]" />
                <span className="text-sm font-medium">Certified Nutritionists</span>
              </span>

              <span className="text-gray-600">•</span>

              <span className="flex items-center space-x-2">
                <Microscope className="w-6 h-6 text-[#00D1FF]" />
                <span className="text-sm font-medium">AI Research Lab</span>
              </span>

              <span className="text-gray-600">•</span>

              <span className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-[#00D1FF]" />
                <span className="text-sm font-medium">Clinical Validation</span>
              </span>

              <span className="text-gray-600">•</span>

              <span className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-[#00D1FF]" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 bg-[#0A0A0A]">
        <div className="max-w-[800px] mx-auto px-8 text-center">
          {/* Title */}
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform<br />Your Health?
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400 mb-10">
            Join thousands who've discovered the smarter path to sustainable nutrition with Dietly AI.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => isProfileComplete ? navigate("/meal-plans/generate") : navigate("/profile-setup")}
            size="lg"
            className="px-12 py-7 bg-gradient-to-r from-[#00D1FF] to-[#00A3FF] hover:shadow-2xl hover:shadow-[#00D1FF]/30 transition-all duration-300 text-lg font-bold"
          >
            <TrendingUp className="w-6 h-6 mr-2" />
            GET STARTED FREE
          </Button>

          {/* Small Print */}
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • 7-day free trial
          </p>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-white/[0.05] py-10">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-gray-500">© 2024 Dietly AI. All rights reserved.</p>

            <div className="flex gap-8 text-sm text-gray-500">
              <button className="hover:text-white transition-colors">Privacy</button>
              <button className="hover:text-white transition-colors">Terms</button>
              <button className="hover:text-white transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
