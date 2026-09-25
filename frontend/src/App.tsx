import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import EditorPage from "./pages/EditorPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  return (
    <BrowserRouter>

      <div className="app-background relative min-h-screen overflow-hidden">

        <div className="background-blob blob-one" />
        <div className="background-blob blob-two" />
        <div className="background-blob blob-three" />

        <div className="relative z-10 min-h-screen">

          <Routes>

            <Route path="/" element={<LoginPage />} />

            <Route
              path="/signup"
              element={<SignupPage />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPasswordPage />}
            />

            <Route
              path="/reset-password"
              element={<ResetPasswordPage />}
            />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/editor"
              element={<EditorPage />}
            />

            <Route
              path="/profile"
              element={<ProfilePage />}
            />

            {/* 404 Page */}
            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
};

export default App;