import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "glass" | "danger";
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
}: ButtonProps) => {
  let buttonStyle = "";

  if (variant === "primary") {
    buttonStyle = "gradient-button text-white";
  }

  if (variant === "glass") {
    buttonStyle = "liquid-button text-slate-200";
  }

  if (variant === "danger") {
    buttonStyle =
      "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        py-2.5
        text-sm
        font-semibold
        ${buttonStyle}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;