import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const DashboardLayout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#246608]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <img
                src="/logo-green.png"
                alt="Logo"
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => navigate("/meals")}
                    variant="ghost"
                    size="sm"
                    className="text-base font-medium text-white hover:text-[#F6F9F6] font-poppins"
                  >
                    Meals
                  </Button>
                  <Button
                    onClick={() => navigate("/progress")}
                    variant="ghost"
                    size="sm"
                    className="text-base font-medium text-white hover:text-[#F6F9F6] font-poppins"
                  >
                    Progress
                  </Button>
                  <Button
                    onClick={() => navigate("/profile/me")}
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
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/login")}
                    variant="ghost"
                    size="sm"
                    className="text-base font-medium text-white hover:text-[#F6F9F6] font-poppins"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    variant="ghost"
                    size="sm"
                    className="text-base font-medium text-white hover:text-[#F6F9F6] font-poppins"
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32">{children}</main>
    </div>
  );
};

export default DashboardLayout;
