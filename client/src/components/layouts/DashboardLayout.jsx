// client/src/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
                onClick={() => navigate("/dashboard")}
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
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Meals
              </Button>

              <Button
                onClick={() => navigate("/progress")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                Progress
              </Button>

              <Button
                onClick={() => navigate("/meal-plans")}
                variant="ghost"
                size="sm"
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-gray-400 hover:text-white hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins
                `}
              >
                My Plans
              </Button>

              {/* Profile Button */}
              <Button
                onClick={() => navigate("/profile-setup")}
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center overflow-hidden"
              >
                <img
                  src="/default-profile.svg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with proper spacing for fixed navbar */}
      <main className="pt-20">{children}</main>
    </div>
  );
};

export default DashboardLayout;
