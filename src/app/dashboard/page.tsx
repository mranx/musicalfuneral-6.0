'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Plus,
  RefreshCw,
  Music,
  Calendar,
  Heart,
  FileText,
  User,
  Mail,
  Phone,
  Clock,
  PenTool,
  MoreHorizontal,
  Users,
  Bookmark,
  CheckCircle,
  Trash2,
  Loader2,
  Clock3
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Define types
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: string;
}

interface Order {
  id: string;
  userId: string;
  relation: string;
  directorName?: string;
  directorCompany?: string;
  directorEmail?: string;
  deceasedName: string;
  dateOfBirth: string;
  dateOfPassing: string;
  serviceDate?: string; // Add serviceDate field
  specialRequests?: string;
  servicePlan: string;
  servicePrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  formData?: any; // Add formData to store the preferences
}

// Define types for display items
interface DisplayItem {
  title: string;
  value: string;
  isMusic: boolean;
}

// Type for the vocal selection
interface VocalSelection {
  id: string;
  name: string;
}

// Type for selection state values mapping
interface SelectionValueMapping {
  [key: string]: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete order state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchOrders();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('Error loading your profile data. Please try again later.');
      console.error('Error fetching user data:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders');

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Fetch form data for each order
      const ordersWithFormData = await Promise.all(
        data.map(async (order: Order) => {
          try {
            const formResponse = await fetch(`/api/forms/${order.id}`);
            if (formResponse.ok) {
              const formData = await formResponse.json();
              return { ...order, formData: formData.formData };
            }
          } catch (err) {
            console.error(`Error fetching form data for order ${order.id}:`, err);
          }
          return order;
        })
      );

      setOrders(ordersWithFormData);

      // Select the first order by default if available
      if (ordersWithFormData.length > 0) {
        setSelectedOrder(ordersWithFormData[0]);
      }
    } catch (err) {
      setError('Error loading your orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchUserData();
    fetchOrders();
  };
  const getRoutePreferenceType = (type: string) => {
    if (!type) return '';

    // Map from database preference type to URL route parameter
    const mappings: Record<string, string> = {
      'secularOrCivilPreference': 'secular',
      'catholicPreference': 'catholic',
      'baptistPreference': 'baptist',
      'anglicanPreference': 'anglican',
      'unitingPreference': 'uniting'
    };

    // Return the mapped value or just remove "Preference" if not in the mappings
    return mappings[type] || type.replace('Preference', '');
  };
  // Delete order function
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      setIsDeleting(true);
      setDeleteError('');

      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete order');
      }

      // Remove the deleted order from state
      setOrders(orders.filter(order => order.id !== selectedOrder.id));

      // Select another order or set to null
      if (orders.length > 1) {
        const newSelected = orders.find(order => order.id !== selectedOrder.id);
        setSelectedOrder(newSelected || null);
      } else {
        setSelectedOrder(null);
      }

      // Close the modal
      setShowDeleteModal(false);

    } catch (error) {
      console.error('Error deleting order:', error);
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle redirect to service preferences selection
  const handleServicePreferencesRedirect = (orderId: string) => {
    // Set orderId in cookie before redirecting
    document.cookie = `currentOrderId=${orderId}; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week expiry
    router.push('/music/choose-preferred-service');
  };

  // Function to find the active preference type in form data
  const getActivePreference = (formData: any) => {
    if (!formData) return null;

    const preferenceTypes = [
      'catholicPreference',
      'baptistPreference',
      'secularOrCivilPreference',
      'anglicanPreference',
      'unitingPreference'
    ];

    for (const type of preferenceTypes) {
      if (formData[type]) {
        return {
          type,
          data: formData[type]
        };
      }
    }

    return null;
  };

  // Function to format preference type name
  const formatPreferenceType = (type: string) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Preference', '')
      .trim();
  };

  // Define mappings for selection values
  const selectionValueMappings: Record<string, SelectionValueMapping> = {
    penitentialRite: { 'lord-have-mercy': 'Lord Have Mercy Vocal' },
    responsorialPsalm: { 'shepherd': 'The Lord is My Shepherd Vocal' },
    lambOfGod: { 'communion1': 'Communion 1' },
    fillerMusic: { 'instrumental': 'Instrumental' },
    finalCommendation: { 'jesus': 'Jesus remember me vocal (mass part)' },
  };

  // Render ALL preference details
  const renderServiceDetails = (formData: any) => {
    if (!formData) return null;

    const activePreference = getActivePreference(formData);
    if (!activePreference) return null;

    const { type, data } = activePreference;

    // For SecularOrCivilPreference
    if (type === 'secularOrCivilPreference') {
      const serviceItems = [
        { title: 'Pre Service', value: data.preService === '20min' ? 'Instrumental (20 minutes)' : data.preService },
        { title: 'Service Start', value: data.serviceStart === 'vocal' ? 'Vocal Performance' : data.serviceStart },
        { title: 'Reflection Piece', value: data.reflectionPiece === 'vocal' ? 'Vocal Performance' : data.reflectionPiece },
        { title: 'Pre Service 2', value: data.preService2 === 'vocal' ? 'Vocal Performance' : data.preService2 },
        { title: 'Service End', value: data.serviceEnd === 'vocal' ? 'Vocal Performance' : data.serviceEnd },
      ];

      const additionalOptions = [
        { title: 'Viewing Music', value: data.viewingMusic ? 'Yes' : 'No' },
        { title: 'Filler Music Pre-Service', value: data.fillerMusicPreService ? 'Yes' : 'No' },
        { title: 'Placing of Symbols', value: data.placingOfSymbols ? 'Yes' : 'No' },
      ];

      return (
        <div>
          <h4 className="text-lg font-medium mb-4">Service Elements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {serviceItems.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                  <Music className="h-5 w-5 text-[#3F72AF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <h4 className="text-lg font-medium mb-4 mt-6">Additional Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {additionalOptions.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                  <CheckCircle className="h-5 w-5 text-[#3F72AF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For Catholic preference
    if (type === 'catholicPreference') {
      // Create a displayable list of all items
      const displayItems: DisplayItem[] = [];
      const vocalSections = data.vocalSelections || {};

      // Add vocal selections to display items
      const vocalLabels: Record<string, string> = {
        startOfRosary: 'Start of Rosary',
        offertoryProcession: 'Offertory Procession',
        holyHoly: 'Holy Holy',
        memorialAcclamation: 'Memorial Acclamation',
        greatAmen: 'Great Amen',
        recessional: 'Recessional',
      };

      Object.entries(vocalSections).forEach(([section, selection]) => {
        if (selection && vocalLabels[section]) {
          displayItems.push({
            title: vocalLabels[section],
            value: (selection as VocalSelection).name,
            isMusic: true
          });
        }
      });

      // Add selection state items
      if (data.selectionState) {
        const selectionLabels: Record<string, string> = {
          penitentialRite: 'Penitential Rite',
          responsorialPsalm: 'Responsorial Psalm',
          lambOfGod: 'Lamb of God',
          fillerMusic: 'Filler Music',
          finalCommendation: 'Final Commendation',
        };

        Object.entries(data.selectionState).forEach(([key, value]) => {
          if (value && selectionLabels[key]) {
            // Use safe type checking for the nested object access
            const mappings = selectionValueMappings[key] || {};
            const displayValue = typeof value === 'string' && mappings[value] ? mappings[value] : String(value);

            displayItems.push({
              title: selectionLabels[key],
              value: displayValue,
              isMusic: true
            });
          }
        });
      }

      // Add additional options
      if (data.additionalOptions) {
        Object.entries(data.additionalOptions).forEach(([key, value]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          displayItems.push({
            title,
            value: value ? 'Yes' : 'No',
            isMusic: false
          });
        });
      }

      // Organize display items into service elements and additional options
      const serviceElements = displayItems.filter(item => item.isMusic);
      const additionalOptions = displayItems.filter(item => !item.isMusic);

      return (
        <div>
          <h4 className="text-lg font-medium mb-4">Service Elements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {serviceElements.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                  <Music className="h-5 w-5 text-[#3F72AF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {additionalOptions.length > 0 && (
            <>
              <h4 className="text-lg font-medium mb-4 mt-6">Additional Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {additionalOptions.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                      <CheckCircle className="h-5 w-5 text-[#3F72AF]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    // For Baptist, Anglican, and Uniting preferences
    if (type === 'baptistPreference' || type === 'anglicanPreference' || type === 'unitingPreference') {
      // Create a displayable list of all items
      const displayItems: DisplayItem[] = [];
      const vocalSections = data.vocalSelections || {};

      // Add vocal selections to display items
      const processionalField = type === 'unitingPreference' ? 'processional' : 'Processional';

      Object.entries(vocalSections).forEach(([section, selection]) => {
        if (selection) {
          let title;
          if (section === processionalField) {
            title = 'Processional';
          } else if (section === 'Recessional') {
            title = 'Recessional';
          } else if (section === 'CongregationalHymn1') {
            title = 'Congregational Hymn 1';
          } else if (section === 'greatAmen') {
            title = 'Great Amen';
          } else if (section === 'recessional') {
            title = 'Recessional';
          } else if (section === 'startOfRosary') {
            title = 'Start of Rosary';
          } else {
            title = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          }

          displayItems.push({
            title,
            value: (selection as VocalSelection).name,
            isMusic: true
          });
        }
      });

      // Add congregational hymn
      if (data.congregationalHymn) {
        displayItems.push({
          title: 'Congregational Hymn',
          value: data.congregationalHymn === 'hymn1' ? 'Hymn 1' : 'Hymn 2',
          isMusic: true
        });
      }

      // Add additional options
      if (data.additionalOptions) {
        Object.entries(data.additionalOptions).forEach(([key, value]) => {
          const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          displayItems.push({
            title,
            value: value ? 'Yes' : 'No',
            isMusic: false
          });
        });
      }

      // Organize display items into service elements and additional options
      const serviceElements = displayItems.filter(item => item.isMusic);
      const additionalOptions = displayItems.filter(item => !item.isMusic);

      return (
        <div>
          <h4 className="text-lg font-medium mb-4">Service Elements</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {serviceElements.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                  <Music className="h-5 w-5 text-[#3F72AF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {additionalOptions.length > 0 && (
            <>
              <h4 className="text-lg font-medium mb-4 mt-6">Additional Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {additionalOptions.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                      <CheckCircle className="h-5 w-5 text-[#3F72AF]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    // Default empty state
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">No service details available</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3F72AF]"></div>
        <p className="mt-4 text-[#3F72AF] font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-center mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{error}</p>
          <Button
            onClick={refreshData}
            className="w-full bg-[#3F72AF] hover:bg-[#2A5A8C] flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-md">
          <div className="text-amber-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-center mb-2">No User Data Found</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">Please try logging in again to access your dashboard.</p>
          <Link href="/login">
            <Button className="w-full bg-[#3F72AF] hover:bg-[#2A5A8C]">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get time since creation
  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  // Get service icon based on plan


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-12">
      {/* Welcome Banner */}
      <div className="w-full bg-[#3F72AF] dark:bg-[#2A5A8C] text-white py-6 px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {userData.name}</h1>
              <p className="mt-1 text-blue-100">Manage your memorial services and account information</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <Button
                onClick={refreshData}
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/20"
              >
                <RefreshCw size={16} className="mr-2" /> Refresh
              </Button>

              <Button
                onClick={() => router.push('/services')}
                className="bg-white text-[#3F72AF] hover:bg-blue-50"
              >
                <Plus size={16} className="mr-2" /> Add New Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left column - Profile & Orders */}
          <div className="xl:col-span-3 space-y-8">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden border-none shadow-lg">
                <div className="bg-gradient-to-r from-[#3F72AF] to-[#4A77B5] h-20"></div>
                <div className="relative px-6">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg">
                    <div className="bg-[#3F72AF] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-semibold">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="pt-8 pb-4 text-center">
                    <h2 className="text-xl font-bold">{userData.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{userData.email}</p>
                  </div>
                </div>
                <CardContent className="pt-0">
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center">
                      <Mail className="text-gray-400 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="text-gray-400 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="font-medium">{userData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="text-gray-400 w-5 h-5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="font-medium">{new Date(userData.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                  <Link href="/dashboard/edit-profile" className="w-full">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-[#3F72AF] text-[#3F72AF] hover:bg-[#3F72AF] hover:text-white">
                      <Edit2 size={16} /> Edit Profile
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#3F72AF] to-[#4A77B5] text-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Music className="mr-2 h-5 w-5" /> Your Memorial Services
                    </CardTitle>
                    <span className="bg-white/20 text-sm py-1 px-3 rounded-full">
                      {orders.length} {orders.length === 1 ? 'Service' : 'Services'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[60vh] overflow-auto">
                    {orders.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No memorial services found</p>
                        <Button
                          onClick={() => router.push('/services')}
                          className="mt-4 bg-[#3F72AF] hover:bg-[#2A5A8C]"
                        >
                          Create Your First Service
                        </Button>
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {orders.map((order) => (
                          <li
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#3F72AF]' : ''
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 text-[#3F72AF] p-2 rounded-lg">
                                <Heart className="h-6 w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="truncate">
                                    <p className="font-medium truncate">{order.deceasedName}</p>
                                  
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(order.status)}`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-[#3F72AF] font-medium">${order.servicePrice}</p>
                                  <p className="text-xs text-gray-500">{getTimeSince(order.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Order Details */}
          <div className="xl:col-span-9">
            {selectedOrder ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Service Overview Card with section edit buttons */}
                <Card className="border-none shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-[#3F72AF] to-[#4A77B5] text-white pb-12">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-100 text-sm">Memorial Service for</p>
                        <CardTitle className="text-2xl mt-1">{selectedOrder.deceasedName}</CardTitle>
                        <CardDescription className="text-blue-100 mt-1">
                          Created on {formatDate(selectedOrder.createdAt)}
                        </CardDescription>
                        <div className="mt-2">
                          <span className="bg-white/20 text-sm py-1 px-3 rounded-full">
                            Order ID: {selectedOrder.id}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)}`}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/edit/${selectedOrder.id}`}>
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                              <Edit2 size={16} className="mr-2" /> Edit Service
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="bg-red-500/10 border-red-500/20 text-white hover:bg-red-500/20"
                            onClick={() => setShowDeleteModal(true)}
                          >
                            <Trash2 size={16} className="mr-2" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative px-6 lg:px-8 -mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Service Plan Card */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-transform hover:scale-105 relative">
                        <div className="absolute top-3 right-3">
                          <Link href={`/dashboard/edit/${selectedOrder.id}?section=service-plan`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center mb-4">
                          <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                            <Music className="h-6 w-6 text-[#3F72AF]" />
                          </div>
                          <div>
                            <h3 className="font-medium">Service Plan</h3>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-[#3F72AF]">{selectedOrder.servicePlan}</p>
                        <p className="mt-2 text-lg font-semibold">${selectedOrder.servicePrice}</p>
                      </div>

                      {/* Important Dates Card */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-transform hover:scale-105 relative">
                        <div className="absolute top-3 right-3">
                          <Link href={`/dashboard/edit/${selectedOrder.id}?section=dates`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center mb-4">
                          <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                            <Calendar className="h-6 w-6 text-[#3F72AF]" />
                          </div>
                          <div>
                            <h3 className="font-medium">Important Dates</h3>
                            <p className="text-sm text-gray-500">Life Journey</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-500">Birth</p>
                            <p className="font-medium">{formatDate(selectedOrder.dateOfBirth)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Passing</p>
                            <p className="font-medium">{formatDate(selectedOrder.dateOfPassing)}</p>
                          </div>
                          {/* Service Date */}
                          <div>
                            <p className="text-sm text-gray-500">Service Date & Time</p>
                            <p className="font-medium">
                              {selectedOrder.serviceDate ? formatDateTime(selectedOrder.serviceDate) : (
                                <span className="text-amber-500 flex items-center">
                                  Not specified <Clock3 className="ml-1 h-4 w-4" />
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Relationship Card */}
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transform transition-transform hover:scale-105 relative">
                        <div className="absolute top-3 right-3">
                          <Link href={`/dashboard/edit/${selectedOrder.id}?section=relationship`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center mb-4">
                          <div className="bg-[#3F72AF]/10 p-2 rounded-lg mr-4">
                            <Users className="h-6 w-6 text-[#3F72AF]" />
                          </div>
                          <div>
                            <h3 className="font-medium">Relationship</h3>
                            <p className="text-sm text-gray-500">Your Connection</p>
                          </div>
                        </div>
                        <p className="text-lg font-medium">{selectedOrder.relation}</p>
                      </div>
                    </div>
                    {/* Service Details Section */}
                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Service Details</h3>
                        {selectedOrder.formData && getActivePreference(selectedOrder.formData) && (
                          <Link href={`/service-preferences/${selectedOrder.id}/${getRoutePreferenceType(getActivePreference(selectedOrder.formData)?.type || '')}`}>
                            <Button size="sm" variant="outline" className="text-[#3F72AF] border-[#3F72AF]">
                              <Edit2 className="h-4 w-4 mr-2" /> Edit Service Details
                            </Button>
                          </Link>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        {selectedOrder.formData && getActivePreference(selectedOrder.formData) ? (
                          <>
                            {getActivePreference(selectedOrder.formData) && (
                              <div className="mb-4">
                                <p className="text-[#3F72AF] font-medium mb-2">
                                  {formatPreferenceType(getActivePreference(selectedOrder.formData)?.type || '')} Service Type
                                </p>
                              </div>
                            )}
                            {renderServiceDetails(selectedOrder.formData)}
                          </>
                        ) : (
                          <div className="text-center py-8">
                            <div className="bg-[#3F72AF]/10 dark:bg-[#3F72AF]/20 p-6 rounded-lg border border-[#3F72AF]/20 dark:border-[#3F72AF]/30 mb-6">
                              <Music className="mx-auto h-12 w-12 text-[#3F72AF] dark:text-[#3F72AF]/80 mb-3" />
                              <h3 className="text-xl font-semibold text-[#3F72AF] dark:text-[#3F72AF]/90 mb-2">Service Preferences Required</h3>
                              <p className="text-[#3F72AF]/80 dark:text-[#3F72AF]/70 mb-6">
                                Please select your service preferences to complete your memorial service setup.
                              </p>
                              <Button
                                className="bg-[#3F72AF] hover:bg-[#2A5A8C] text-white"
                                onClick={() => handleServicePreferencesRedirect(selectedOrder.id)}
                              >
                                <Music className="mr-2 h-4 w-4" /> Select Service Preferences
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Funeral Director Information */}
                  <Card className="border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5 text-[#3F72AF]" /> Funeral Director
                        </CardTitle>
                        <CardDescription>
                          Contact information
                        </CardDescription>
                      </div>
                      <Link href={`/dashboard/edit/${selectedOrder.id}?section=director`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </Link>
                    </CardHeader>

                    <CardContent>
                      {selectedOrder.directorName ? (
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <User className="text-gray-400 w-5 h-5 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                              <p className="font-medium">{selectedOrder.directorName}</p>
                            </div>
                          </div>

                          {selectedOrder.directorCompany && (
                            <div className="flex items-center">
                              <Bookmark className="text-gray-400 w-5 h-5 mr-3" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                                <p className="font-medium">{selectedOrder.directorCompany}</p>
                              </div>
                            </div>
                          )}

                          {selectedOrder.directorEmail && (
                            <div className="flex items-center">
                              <Mail className="text-gray-400 w-5 h-5 mr-3" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium">{selectedOrder.directorEmail}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <User className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500">No funeral director details provided</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Special Requests */}
                  <Card className="border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <PenTool className="mr-2 h-5 w-5 text-[#3F72AF]" /> Special Requests
                        </CardTitle>
                        <CardDescription>
                          Additional instructions
                        </CardDescription>
                      </div>
                      <Link href={`/dashboard/edit/${selectedOrder.id}?section=requests`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </Link>
                    </CardHeader>

                    <CardContent>
                      {selectedOrder.specialRequests ? (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded border border-gray-100 dark:border-gray-700">
                          <p className="italic text-gray-700 dark:text-gray-300">"{selectedOrder.specialRequests}"</p>
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500">No special requests provided</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="text-center border-none shadow-lg">
                  <CardContent className="pt-16 pb-16">
                    <div className="mx-auto rounded-full bg-[#3F72AF]/10 p-6 w-fit mb-6">
                      <Music className="h-12 w-12 text-[#3F72AF]" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Create Your First Memorial Service</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                      Select an existing service from the list or create a new one to provide a meaningful tribute for your loved one.
                    </p>

                    <Button
                      onClick={() => router.push('/services')}
                      className="bg-[#3F72AF] hover:bg-[#2A5A8C] text-white px-6 py-3"
                    >
                      <Plus className="mr-2 h-5 w-5" /> Create New Service
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Delete Order</h3>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete this memorial service for <span className="font-medium">{selectedOrder.deceasedName}</span>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <p className="text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteOrder}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}