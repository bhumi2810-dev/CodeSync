import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/common/Input";
import Button from "../components/common/Button";

const SignupPage = () => {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error State
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] =
    useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  // Validate Form
  const validateForm = () => {
    let isValid = true;

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

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

      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
      }
    }

    // Password Validation
    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(
        "Password must be at least 8 characters."
      );
      isValid = false;
    }

    // Confirm Password Validation
    if (!confirmPassword.trim()) {
      setConfirmPasswordError(
        "Please confirm your password."
      );
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

    // Temporary frontend API simulation.
    // Backend signup will be connected later.
    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    console.log("Account Created");

    console.log({
      name,
      email,
      password,
    });

    setLoading(false);
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
          }}
          error={emailError}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
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
