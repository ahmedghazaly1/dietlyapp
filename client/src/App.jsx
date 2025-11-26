import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MealProvider } from "./context/MealContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DashboardUser from "./pages/DashboardUser";
import DashboardGuest from "./pages/DashboardGuest";
import ProfileSetup from "./pages/profile/ProfileSetup";
import Profile from "./pages/profile/Profile";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import Chatbot from "./pages/Chatbot"; // Add this import
import LoadingSpinner from "./components/common/LoadingSpinner";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Route for logged-in users
const ProtectedRoute = ({ children, allowJustRegistered = false }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    if (allowJustRegistered && justRegistered) return children;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Route for guests
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (isAuthenticated) {
    if (justRegistered) return <Navigate to="/profile-setup" replace />;
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

// Public route - accessible to both guests and logged-in users
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, justRegistered } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If user is authenticated and just registered, redirect to profile setup
  if (isAuthenticated && justRegistered) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

// Guest Layout component with navbar
const GuestLayout = ({ children }) => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
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
            <div
              className="flex items-center space-x-6 cursor-pointer"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <img
                src={scrolled ? "/logo-white.png" : "/logo-green.png"}
                alt="Logo"
                className="w-24 h-24 md:w-32 md:h-32"
              />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => (window.location.href = "/meals")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Browse Meals
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Login
              </button>
              <button
                onClick={() => (window.location.href = "/register")}
                className={`
                  text-base font-medium transition-colors duration-300
                  ${
                    scrolled
                      ? "text-white hover:text-yellow-200 hover:bg-white/5"
                      : "text-black hover:text-gray-600 hover:bg-gray-100"
                  }
                  font-poppins px-4 py-2 rounded-lg
                `}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20">
        {" "}
        {/* Add padding to account for fixed navbar */}
        {children}
      </div>
    </div>
  );
};

// Component to conditionally wrap meals in appropriate layout
const MealsRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <DashboardLayout>
      <Meals />
    </DashboardLayout>
  ) : (
    <GuestLayout>
      <Meals />
    </GuestLayout>
  );
};

// Component to conditionally wrap meal detail in appropriate layout
const MealDetailRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <DashboardLayout>
      <MealDetailPage />
    </DashboardLayout>
  ) : (
    <GuestLayout>
      <MealDetailPage />
    </GuestLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <Router>
          <Routes>
            {/* Auth pages */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register />
                </GuestRoute>
              }
            />

            {/* Profile Setup */}
            <Route
              path="/profile-setup"
              element={
                <ProtectedRoute allowJustRegistered={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Profile />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Settings Page */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Change Password Page */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ChangePassword />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Chatbot Page - PROTECTED (Logged-in users only) */}
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Chatbot />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            {/* Guest Dashboard */}
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <DashboardGuest />
                </GuestRoute>
              }
            />

            {/* Logged-in Dashboard User */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />

            {/* Public Meal Pages - Accessible without authorization */}
            <Route
              path="/meals"
              element={
                <PublicRoute>
                  <MealsRoute />
                </PublicRoute>
              }
            />
            <Route
              path="/meals/:id"
              element={
                <PublicRoute>
                  <MealDetailRoute />
                </PublicRoute>
              }
            />

            {/* Other protected pages */}
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Progress />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlans />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meal-plans/view/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealPlanView />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 */}
            <Route
              path="*"
              element={
                <div className="text-center text-2xl py-20">
                  404 - Page Not Found
                </div>
              }
            />
          </Routes>
        </Router>
      </MealProvider>
    </AuthProvider>
  );
}

export default App;
