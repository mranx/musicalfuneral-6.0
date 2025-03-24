"use client";
import React, { forwardRef } from "react";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the props type
interface MoveBackButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const MoveBackButton = forwardRef<HTMLButtonElement, MoveBackButtonProps>(
  ({ size = 40, onClick, ...props }, ref) => {
    const router = useRouter();

    return (
      <button
        onClick={(e) => {
          if (onClick) onClick(e);
          router.back();
        }}
        ref={ref}
        {...props}
      >
        <MoveLeft size={size} />
      </button>
    );
  }
);
MoveBackButton.displayName = "MoveBackButton";
export default MoveBackButton;
