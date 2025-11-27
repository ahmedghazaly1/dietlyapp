import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Add this import
import api from "../services/api";

// ✅ FIXED IMPORT PATHS
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import {
  LogOut,
  Sparkles,
  Users,
  Utensils,
  Shield,
  Settings,
  User,
  ChevronRight,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, logout } = useAuth(); // Add this line to get logout function
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Mock admin user - replace with actual auth
  const adminUser = {
    name: "Admin User",
    email: "admin@dietly.ai",
  };

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);

        // Replace with your actual API endpoint
        const response = await api.get("/admin/stats"); // or whatever your endpoint is

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error("Failed to fetch stats");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
        // Optionally set fallback data here
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // Use the logout function from useAuth
    navigate("/"); // Redirect to login page after logout
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-black">
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
                className="w-24 h-24 md:w-32 md:h-32 cursor-pointer"
              />
            </div>

            {/* Admin Badge & Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full">
                <Shield className="w-4 h-4 text-[#246608]" />
                <span className="text-xs font-semibold text-[#246608] tracking-widest">
                  ADMIN PANEL
                </span>
              </div>

              <div className="relative" ref={dropdownRef}>
                <Button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 rounded-full p-0 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#246608] transition-all"
                >
                  <img
                    src="/default-profile.svg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 font-poppins">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {adminUser?.name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {adminUser?.email || "admin@example.com"}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#246608]/10 flex items-center space-x-3 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#246608]" />
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        onClick={handleSettingsClick}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#246608]/10 flex items-center space-x-3 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#246608]" />
                        <span className="font-medium">Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#246608]/10 border border-[#246608]/20 rounded-full">
                <Sparkles className="w-4 h-4 text-[#246608]" />
                <span className="text-xs font-semibold text-[#246608] tracking-widest">
                  ADMIN CONTROL CENTER
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                MANAGE YOUR
                <br />
                DIETLY AI
                <br />
                PLATFORM
              </h1>

              {/* Sub-headline */}
              <p className="text-lg text-[#246608]/80 leading-relaxed max-w-lg">
                Complete control over users and meal management. Monitor,
                update, and optimize your platform.
              </p>
            </div>

            {/* Admin Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-12">
              {/* Manage Users Card */}
              <Card
                onClick={() => navigate("/admin/users")}
                className="bg-[#246608]/10 border-[#246608]/20 rounded-3xl shadow-xl hover:shadow-2xl hover:border-[#246608]/40 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2F7A0A] to-[#246608] flex items-center justify-center">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          Manage Users
                        </h3>
                        <p className="text-[#246608]/70 text-sm leading-relaxed">
                          View, edit, and manage all user accounts. Monitor user
                          activity and permissions.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#246608] group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>

              {/* Manage Meals Card */}
              <Card
                onClick={() => navigate("/admin/meals")}
                className="bg-[#246608]/10 border-[#246608]/20 rounded-3xl shadow-xl hover:shadow-2xl hover:border-[#246608]/40 transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2F7A0A] to-[#246608] flex items-center justify-center">
                        <Utensils className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">
                          Manage Meals
                        </h3>
                        <p className="text-[#246608]/70 text-sm leading-relaxed">
                          Create, update, and organize meal plans. Manage
                          nutritional data and recipes.
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#246608] group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== QUICK STATS ==================== */}
      <section className="relative py-12 border-y border-[#246608]/20">
        <div className="max-w-[1200px] mx-auto px-8">
          {loadingStats ? (
            <div className="text-center text-[#246608] text-lg">
              Loading stats...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 text-lg">{error}</div>
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {/* Total Users */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#246608] mb-1">
                  {stats.users?.total?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-[#246608]/70">Total Users</div>
              </div>

              {/* Active Meal Plans */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#246608] mb-1">
                  {stats.mealPlans?.active?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-[#246608]/70">Active Plans</div>
              </div>

              {/* Total Meals */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#246608] mb-1">
                  {stats.meals?.total?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-[#246608]/70">Total Meals</div>
              </div>

              {/* Users with Active Plans */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#246608] mb-1">
                  {stats.users?.withActivePlans?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-[#246608]/70">Active Users</div>
              </div>

              {/* Progress Entries */}
              <div className="text-center">
                <div className="text-3xl font-bold text-[#246608] mb-1">
                  {stats.progress?.totalEntries?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-[#246608]/70">
                  Progress Entries
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[#246608] text-lg">
              No stats available
            </div>
          )}
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="relative py-24 bg-[#246608]/10">
        <div className="max-w-[800px] mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Powerful Tools
            <br />
            At Your Fingertips
          </h2>
          <p className="text-lg text-[#246608]/80 mb-10">
            Everything you need to manage and optimize the Dietly AI platform
            efficiently.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/admin/users")}
              size="lg"
              className="px-8 py-6 bg-gradient-to-r from-[#2F7A0A] to-[#246608] hover:shadow-2xl hover:shadow-[#246608]/30 transition-all duration-300 text-base font-semibold"
            >
              <Users className="w-5 h-5 mr-2" />
              MANAGE USERS
            </Button>
            <Button
              onClick={() => navigate("/admin/meals")}
              size="lg"
              className="px-8 py-6 bg-gradient-to-r from-[#2F7A0A] to-[#246608] hover:shadow-2xl hover:shadow-[#246608]/30 transition-all duration-300 text-base font-semibold"
            >
              <Utensils className="w-5 h-5 mr-2" />
              MANAGE MEALS
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-[#246608]/20 py-10">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-[#246608]/70">
              © 2024 Dietly AI. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-[#246608]/70">
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

export default AdminDashboard;
