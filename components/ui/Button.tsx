import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]",
    lg: "px-6 py-3.5 text-base font-semibold min-h-[50px]",
  };

  const variantStyles = {
    primary:
      "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow focus:ring-primary/40",
    secondary:
      "bg-secondary hover:bg-secondary-hover text-white shadow-sm hover:shadow focus:ring-secondary/40",
    outline:
      "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 focus:ring-slate-200",
    ghost:
      "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-200",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow focus:ring-red-300",
    accent:
      "bg-accent hover:bg-accent-hover text-white shadow-sm hover:shadow focus:ring-accent/40",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          Memproses...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
