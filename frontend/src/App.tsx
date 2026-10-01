import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import ProfilePage from "./pages/ProfilePage";
import GithubCallbackPage from "./pages/GithubCallbackPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-background relative min-h-screen overflow-hidden">
          <div className="background-blob blob-one" />
          <div className="background-blob blob-two" />
          <div className="background-blob blob-three" />

          <div className="relative z-10 min-h-screen">
            <Routes>
              {/* Public-only routes (redirect to /dashboard if already logged in) */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Password Reset Route */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* OAuth Handlers */}
              <Route path="/oauth-success" element={<OAuthSuccessPage />} />
              <Route path="/auth/github/callback" element={<GithubCallbackPage />} />

              {/* Protected routes (redirect to / if not authenticated) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/editor/:roomId" element={<EditorPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;