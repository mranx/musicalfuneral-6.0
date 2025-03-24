'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MusicIcon, Music2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

// Import all your preference forms here
// Example: 
// import SecularOrCivilPreferenceForm from '@/components/forms/SecularOrCivilPreferenceForm';
// import BaptistPreferenceForm from '@/components/forms/BaptistPreferenceForm';
// etc.

export default function ServicePreferences({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Preference types
  const preferenceTypes = [
    { id: 'secular', name: 'Secular/Civil Service', value: 'secularOrCivilPreference' },
    { id: 'catholic', name: 'Catholic Service', value: 'catholicPreference' },
    { id: 'baptist', name: 'Baptist Service', value: 'baptistPreference' },
    { id: 'anglican', name: 'Anglican Service', value: 'anglicanPreference' },
    { id: 'uniting', name: 'Uniting Service', value: 'unitingPreference' }
  ];
  
  useEffect(() => {
    fetchOrderData();
  }, [params.orderId]);
  
  const fetchOrderData = async () => {
    try {
      setLoading(true);
      // Fetch order details
      const orderResponse = await axios.get(`/api/orders/${params.orderId}`);
      
      if (!orderResponse.data) {
        throw new Error('Order not found');
      }
      
      setOrderData(orderResponse.data);
      
      // Check if there's already a service preference set
      const formResponse = await axios.get(`/api/forms/${params.orderId}`);
      
      if (formResponse.data.success && formResponse.data.formData) {
        // Find which preference type is already set
        for (const type of preferenceTypes) {
          if (formResponse.data.formData[type.value]) {
            setSelectedType(type.id);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      setError('Could not load order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreferenceTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    
    // Redirect to the appropriate form
    // You would need to create routes for each form type
    router.push(`/service-preferences/${params.orderId}/${typeId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A77B5]"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <p>{error}</p>
          </div>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Preferences
          </h1>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Service Type</CardTitle>
            <CardDescription>
              Choose the type of service you would like for {orderData?.deceasedName || 'your loved one'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferenceTypes.map((type) => (
                <Button
                  key={type.id}
                  className={`flex items-center justify-start h-auto p-4 ${
                    selectedType === type.id 
                      ? 'bg-[#3F72AF] text-white hover:bg-[#2A5A8C]' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => handlePreferenceTypeSelect(type.id)}
                >
                  <Music2 className="mr-3 h-5 w-5" />
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-md">
              <p className="text-blue-800 text-sm">
                Select a service type to customize the musical elements for the memorial service. 
                You can always come back and change your selection later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}