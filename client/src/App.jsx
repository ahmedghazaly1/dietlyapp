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
import Meals from "./pages/Meals";
import MealDetailPage from "./pages/MealDetailPage";
import Progress from "./pages/Progress";
import MealPlans from "./pages/MealPlans";
import MealPlanView from "./components/meal-plans/MealPlanView";
import LoadingSpinner from "./components/common/LoadingSpinner";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Admin pages
import DashboardAdmin from "./pages/DashboardAdmin";
import ManageUsers from "./pages/ManageUsers";
import ManageMeals from "./pages/ManageMeals";

/* ============================
   PROTECTED ROUTE
   ============================ */
const ProtectedRoute = ({ children, allowIncompleteProfile = false }) => {
  const { isAuthenticated, loading, isProfileComplete, user } = useAuth();

  if (loading || isProfileComplete === null) return <LoadingSpinner />;

  // Not logged in → Redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admins bypass all profile rules
  if (user?.role === "admin") {
    return children;
  }

  // Normal users must complete profile
  if (!allowIncompleteProfile && !isProfileComplete) {
    return <Navigate to="/profile-setup" replace />;
  }

  return children;
};

/* ============================
   GUEST ROUTE — FIXED
   ============================ */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  // If authenticated → route based on role
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin-dashboard" : "/user-dashboard"}
        replace
      />
    );
  }

  return children;
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
                <ProtectedRoute allowIncompleteProfile={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
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

            {/* Settings */}
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

            {/* Guest Dashboard (NOT logged in) */}
            <Route
              path="/dashboard"
              element={
                <GuestRoute>
                  <DashboardGuest />
                </GuestRoute>
              }
            />

            {/* User Dashboard */}
            <Route
              path="/user-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              }
            />

            {/* ADMIN Dashboard */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/meals"
              element={
                <ProtectedRoute>
                  <ManageMeals />
                </ProtectedRoute>
              }
            />

            {/* Meals */}
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Meals />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/meals/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MealDetailPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Progress */}
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

            {/* Meal Plans */}
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

            {/* Root */}
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
