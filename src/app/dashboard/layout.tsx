'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This provides an additional layer of protection on the client side
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A77B5]"></div>
      </div>
    );
  }

  // If authenticated, render the dashboard content
  return <>{children}</>;
}