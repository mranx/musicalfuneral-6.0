"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import ThemeTogglerSwitch from "../switch/ThemeTogglerSwitch";
import { Cross as Hamburger } from "hamburger-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { User, LogOut } from "lucide-react";

// ------------ types --------------
// navlink type
type navlink = {
  label: string;
  href: string;
  isFilled?: boolean;
};

// navlinks array
const navlinksArray: Array<navlink> = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Reviews", href: "/reviews" },
  { label: "About", href: "/about" },
  {
    label: "Contact",
    href: "/contact"
  },
];

// Auth component with forced page refresh for desktop
const NavbarAuth = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Handle sign out with complete page refresh
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Use a callback function to ensure we complete redirection
      await signOut({ 
        redirect: false,
        callbackUrl: "/"
      });
      
      // Clear any session storage or localStorage that might be caching session data
      if (typeof window !== "undefined") {
        // Clear any NextAuth.js session data from localStorage
        localStorage.removeItem("next-auth.session-token");
        localStorage.removeItem("next-auth.callback-url");
        localStorage.removeItem("next-auth.csrf-token");
        
        // Force a complete page refresh to ensure all state is reset
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force reload even on error
      window.location.reload();
    }
  };

  // During initial loading, show a simple space holder
  if (status === "loading") {
    return <div className="w-10 h-10"></div>;
  }

  // If authenticated, show profile icon with dropdown
  if (status === "authenticated" && session?.user) {
    return (
      <div className="relative">
        {/* Profile button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#3F72AF] text-white hover:bg-[#2A5A8C] transition-colors"
        >
          <User size={20} />
        </button>
        
        {/* Dropdown - simplified for maximum compatibility */}
        {isOpen && (
          <div 
            className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#232741] shadow-lg rounded-md overflow-hidden"
            style={{
              zIndex: 9999,
              transform: 'none',
              visibility: 'visible',
              opacity: 1,
              pointerEvents: 'auto'
            }}
          >
            {/* Dropdown menu items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2D45]"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A2D45] flex items-center"
              >
                {isSigningOut ? (
                  <span>Signing out...</span>
                ) : (
                  <>
                    <LogOut size={16} className="mr-2" /> Sign out
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If not authenticated, show login button
  return (
    <Link
      href="/login"
      className="py-2 px-4 rounded-full text-white bg-[#3F72AF] tracking-wider dark:text-[#191C30] font-semibold text-[13px] hover:bg-[#2A5A8C] transition-colors"
    >
      Login
    </Link>
  );
};

// Mobile auth component with hard refresh
const MobileNavbarAuth = () => {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Handle sign out with complete page refresh
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Use a callback function to ensure we complete redirection
      await signOut({ 
        redirect: false,
        callbackUrl: "/"
      });
      
      // Clear any session storage or localStorage that might be caching session data
      if (typeof window !== "undefined") {
        // Clear any NextAuth.js session data from localStorage
        localStorage.removeItem("next-auth.session-token");
        localStorage.removeItem("next-auth.callback-url");
        localStorage.removeItem("next-auth.csrf-token");
        
        // Force a complete page refresh to ensure all state is reset
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force reload even on error
      window.location.reload();
    }
  };

  // During initial loading, show a simple space holder
  if (status === "loading") {
    return <div className="w-full h-10"></div>;
  }

  // If authenticated, show dashboard and sign out buttons
  if (status === "authenticated" && session?.user) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/dashboard"
          className="w-full py-2 px-4 rounded-full text-white bg-[#3F72AF] tracking-wider dark:text-[#191C30] font-semibold text-[13px] hover:bg-[#2A5A8C] transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full py-2 px-4 rounded-full text-[#3F72AF] border border-[#3F72AF] tracking-wider font-semibold text-[13px] hover:bg-[#3F72AF] hover:text-white dark:hover:text-[#191C30] transition-colors"
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  // If not authenticated, show login button
  return (
    <Link
      href="/login"
      className="py-2 px-4 rounded-full text-white bg-[#3F72AF] tracking-wider dark:text-[#191C30] font-semibold text-[13px] hover:bg-[#2A5A8C] transition-colors"
    >
      Login
    </Link>
  );
};

const MainNavbar = () => {
  const [showNavlinks, setShowNavlinks] = useState(false);
  const navlinks = useRef<null | HTMLUListElement>(null);
  const pathname = usePathname();

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Add logic here if needed for other dropdowns
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (navlinks.current) {
      if (showNavlinks && window.innerWidth < 992) {
        navlinks.current.style.height = navlinks.current?.scrollHeight + "px";
      } else if (!showNavlinks && window.innerWidth < 992) {
        navlinks.current.style.height = 0 + "px";
      } else {
        navlinks.current.style.height = navlinks.current?.scrollHeight + "px";
      }
    }
  }, [showNavlinks]);

  return (
    <nav className={twMerge("px-6 dark:bg-[#191C30]")}>
      {/* =========== container ===========  */}
      <div className="text-inherit max-w-2xl-container mx-auto py-6 flex gap-x-5 items-center justify-between max-lg:flex-col max-lg:items-stretch">
        {/* -------------- logo and hamburger ------------------ */}
        <div className="text-inherit max-lg:flex justify-between items-center gap-2 ">
          <Link href={"/"} className="  ">
            <Image
              src={"/assets/images/icons/logoLight.PNG"}
              alt=""
              width={400}
              height={50}
              className="aspect-[7.87/1] dark:hidden object-contain h-12"
            />
            <Image
              src={"/assets/images/icons/logoDark.PNG"}
              alt=""
              width={400}
              height={50}
              className="aspect-[7.87/1] hidden dark:inline-block object-contain h-12"
            />
          </Link>
          <div className="lg:hidden flex justify-center items-center gap-2">
            <ThemeTogglerSwitch />
            <Hamburger
              toggled={showNavlinks}
              toggle={setShowNavlinks}
              size={30}
            />
          </div>
        </div>

        {/* -------------- navigation links --------------- */}
        <ul
          className={`text-inherit flex items-center gap-x-8 gap-y-2 overflow-visible max-lg:hidden`}
        >
          {navlinksArray.map((navlink) => {
            const isActive = pathname === navlink.href;
            return (
              <li
                className={cn(
                  `py-1 relative`,
                  isActive && !navlink.isFilled
                    ? "text-[#3F72AF] after:w-full"
                    : "after:w-0",
                  navlink.isFilled
                    ? ""
                    : "after:absolute after:bottom-0.5 after:left-0 after:h-0.5 after:bg-[#3F72AF] after:duration-150 hover:after:w-full"
                )}
                key={navlink.label}
              >
                <Link
                  href={navlink.href}
                  className={cn(
                    "text-inherit font-semibold text-[13px]",
                    navlink.isFilled &&
                      "py-2 px-4 rounded-full text-white bg-[#3F72AF] tracking-wider dark:text-[#191C30]"
                  )}
                >
                  {navlink.label}
                </Link>
              </li>
            );
          })}

          {/* Auth Button / Profile Icon */}
          <li className="relative" style={{ overflow: 'visible' }}>
            <NavbarAuth />
          </li>

          <li className="flex justify-center items-center">
            <ThemeTogglerSwitch />
          </li>
        </ul>

        {/* ---------- navlinks and start project responsive for mobile and tablets ---------  */}
        <ul
          className={`text-inherit flex items-center gap-x-8 gap-y-2 duration-300 flex-col overflow-hidden lg:hidden h-0`}
          ref={navlinks}
        >
          {navlinksArray.map((navlink) => {
            const isActive = pathname === navlink.href;
            return (
              <li
                className={cn(
                  `py-1 relative`,
                  isActive && !navlink.isFilled
                    ? "text-[#3F72AF] after:w-full"
                    : "after:w-0",
                  navlink.isFilled
                    ? ""
                    : "after:absolute after:bottom-0.5 after:left-0 after:h-0.5 after:bg-[#3F72AF] after:duration-150 hover:after:w-full"
                )}
                key={navlink.label}
              >
                <Link
                  href={navlink.href}
                  className={cn(
                    "text-inherit font-semibold text-[13px]",
                    navlink.isFilled &&
                      "py-2 px-4 rounded-full text-white bg-[#3F72AF] tracking-wider dark:text-[#191C30]"
                  )}
                >
                  {navlink.label}
                </Link>
              </li>
            );
          })}

          {/* Auth Button for mobile */}
          <li className="w-full text-center mt-2">
            <MobileNavbarAuth />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MainNavbar;