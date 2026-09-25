import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card = ({ children, className = "" }: CardProps) => {
  return (
    <div
      className={`
        glass-card
        rounded-2xl
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;