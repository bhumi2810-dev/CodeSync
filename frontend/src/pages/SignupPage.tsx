import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiGithub } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/api";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error State
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);

  // Loading State
  const [loading, setLoading] = useState(false);

  // Validate Form
  const validateForm = () => {
    let isValid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGeneralError("");
    setIsDuplicateEmail(false);

    // Name Validation
    if (!name.trim()) {
      setNameError("Full name is required.");
      isValid = false;
    }

    // Email Validation
    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
      }
    }

    // Password Validation
    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      isValid = false;
    }

    // Confirm Password Validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  // Handle Signup
  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 409) {
        setIsDuplicateEmail(true);
        setGeneralError("This email is already registered. Please log in instead.");
      } else if (err.response?.data?.message) {
        setGeneralError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (errors.email) setEmailError(errors.email.join(", "));
        if (errors.password) setPasswordError(errors.password.join(", "));
        if (errors.name) setNameError(errors.name.join(", "));
      } else {
        setGeneralError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6">
        {/* Heading */}
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-indigo-400">
            Get started
          </p>

          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Create Account
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Join CodeSync and start collaborating
          </p>
        </div>

        {/* General / Duplicate Email Error Banner */}
        {generalError && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
          >
            <p className="font-medium">{generalError}</p>
            {isDuplicateEmail && (
              <Link
                to="/"
                className="mt-2 inline-block font-semibold text-indigo-400 underline hover:text-indigo-300"
              >
                Go to Sign In →
              </Link>
            )}
          </div>
        )}

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError("");
          }}
          error={nameError}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError("");
            setIsDuplicateEmail(false);
          }}
          error={emailError}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Create a password (min 8 characters)"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setPasswordError("");
          }}
          error={passwordError}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setConfirmPasswordError("");
          }}
          error={confirmPasswordError}
        />

        {/* Create Account Button */}
        <Button
          onClick={handleSignup}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* GitHub */}
        <button
          type="button"
          onClick={() => {
            window.location.href = `${API_URL}/api/auth/github`;
          }}
          className="liquid-button flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <FiGithub size={18} className="text-white" />
          Continue with GitHub
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
