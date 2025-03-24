'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  HelpCircle, 
  Package, 
  DollarSign, 
  Film, 
  List,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserPlus,
  Users,
  Settings,
  FileText
} from 'lucide-react';
import Cookies from 'js-cookie';

// Define interfaces for type safety
interface User {
  name?: string;
  email?: string;
  dashboardLink?: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavItem[];
  isDropdown?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is on the login page
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Skip auth check on login page
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    // Check if user is logged in
    const token = Cookies.get('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user', error);
      }
    }

    // Verify token with backend
    const verifyToken = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        Cookies.remove('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router, pathname, isLoginPage]);

  const handleLogout = () => {
    Cookies.remove('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // If on login page or loading, just render children
  if (isLoginPage || loading) {
    return <>{children}</>;
  }

  // Site Settings items
  const siteSettingsItems: NavItem[] = [
    { name: 'Hero Section', href: '/admin/content/hero', icon: <FileText size={20} /> },
    { name: 'Services', href: '/admin/content/services', icon: <Package size={20} /> },
    { name: 'About Section', href: '/admin/content/about', icon: <FileText size={20} /> },
    { name: 'Pricing', href: '/admin/content/pricing', icon: <DollarSign size={20} /> },
    { name: 'Video Demos', href: '/admin/content/videos', icon: <Film size={20} /> },
    { name: 'How It Works', href: '/admin/content/how-it-works', icon: <List size={20} /> },
    { name: 'FAQs', href: '/admin/content/faqs', icon: <HelpCircle size={20} /> },
  ];

  // Navigation structure
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Manage Administrators', href: '/admin/dashboard/admins', icon: <Users size={20} /> },
    {
      name: 'Site Settings', 
      icon: <Settings size={20} />, 
      children: siteSettingsItems,
      isDropdown: true
    }
  ];

  // Toggle dropdown
  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="ml-2 text-xl font-semibold">Admin Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-red-500 hover:text-red-700"
        >
          <LogOut size={18} className="mr-1" />
          <span>Logout</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out z-30 h-full`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <Image 
              src="/assets/images/icons/logoLight.PNG" 
              alt="Logo" 
              width={120} 
              height={40}
              className="h-8 w-auto" 
            />
          </div>

          {/* User Info Section */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((section) => (
              <div key={section.name}>
                {section.isDropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(section.name)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium ${
                        section.children?.some(child => pathname === child.href)
                          ? 'bg-[#4A77B5] text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        {section.icon}
                        <span className="ml-3">{section.name}</span>
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={`transform transition-transform duration-200 ${
                          openDropdown === section.name ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Dropdown Content */}
                    {openDropdown === section.name && section.children && (
                      <div className="pl-6 space-y-1 mt-1">
                        {section.children.map((child) => (
                          <Link 
                            key={child.name} 
                            href={child.href || '/'} // Provide a fallback URL
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                              pathname === child.href 
                                ? 'bg-[#4A77B5] text-white' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {child.icon}
                            <span className="ml-3">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    href={section.href || '/'} // Provide a fallback URL
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                      pathname === section.href 
                        ? 'bg-[#4A77B5] text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {section.icon}
                    <span className="ml-3">{section.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}