import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Adjust the import path as needed

interface PreviousButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const PreviousButton = forwardRef<HTMLButtonElement, PreviousButtonProps>(
  ({ label = "Previous", className, onClick, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick(e); // Use the provided onClick function
      } else {
        router.back(); // Default to router.back if no custom onClick
      }
    };

    return (
      <button
        type="button"
        ref={ref}
        className={twMerge(
          "px-10 py-2.5 text-black rounded-full font-medium bg-[#F8F8F8] dark:bg-[#2a304d] dark:text-white",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {label}
      </button>
    );
  }
);

PreviousButton.displayName = "PreviousButton";

export default PreviousButton;
