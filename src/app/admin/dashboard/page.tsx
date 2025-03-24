'use client';

import { 
  Users,
  Globe,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists in cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const adminTokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
      
      if (!adminTokenCookie) {
        // No token found, redirect to login
        router.replace('/admin/login');
      } else {
        // Token exists, allow rendering the dashboard
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Show nothing while checking authentication
  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Only render the dashboard content when authenticated
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your website content and admin access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Link href="/admin/dashboard/admins">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="bg-violet-50 dark:bg-violet-900/20 rounded-t-lg">
              <div className="flex justify-between items-center">
                <Users className="h-8 w-8 text-violet-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-lg mb-1">Administrators</CardTitle>
              <CardDescription>Manage admin accounts and access</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/" target="_blank">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 rounded-t-lg">
              <div className="flex justify-between items-center">
                <Globe className="h-8 w-8 text-gray-500" />
                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                  External
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <CardTitle className="text-lg mb-1">Visit Website</CardTitle>
              <CardDescription>Preview your changes on the live site</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Commonly used functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/dashboard/admins">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Administrators
                </Link>
              </Button>
             
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/">
                  <Globe className="mr-2 h-4 w-4" />
                  View Live Website
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Tips for using the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
              <li>Use the sidebar to navigate between different sections</li>
              <li>Manage administrators from the new Administrators section</li>
              <li>Add new admins with granular access control</li>
              <li>All changes will be immediately visible on your website</li>
              <li>Preview your site before making live changes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}