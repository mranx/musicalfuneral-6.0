import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Adjust the import path as needed

interface NextButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  link?: string;
}

const NextButton = forwardRef<HTMLButtonElement, NextButtonProps>(
  ({ label = "Previous", className, onClick, link, ...props }, ref) => {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (onClick) {
        onClick(e); // Use the provided onClick function
      } else {
        if (link) {
          router.push(link);
        }
      }
    };

    return (
      <Button
        ref={ref}
        type="submit"
        className={twMerge(
          "px-10 py-2.5 rounded-full font-medium bg-[#3F72AF] hover:bg-[#172e4b] text-white",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        Next
      </Button>
    );
  }
);

NextButton.displayName = "NextButton";

export default NextButton;
