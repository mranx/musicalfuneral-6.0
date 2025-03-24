'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FinalVideoLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      console.log('Not authenticated, redirecting to login from final-video layout...');
      router.push('/login?callbackUrl=' + encodeURIComponent(window.location.href));
    }
  }, [status, router]);
  
  // Show loading state or children based on authentication status
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F72AF]"></div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-gray-500">You need to be logged in to access this page</p>
          <button
            onClick={() => router.push('/login?callbackUrl=' + encodeURIComponent(window.location.href))}
            className="mt-4 px-4 py-2 bg-[#3F72AF] text-white rounded-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // If authenticated, show the content
  return <>{children}</>;
}