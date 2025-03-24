'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

// Import the renderPreferenceForm function
import renderPreferenceForm from '@/_mycomponents/forms/preference-forms/renderPreferenceForm';

// Add a notification component
const SaveNotification = ({ message }: { message: string }) => (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg flex items-center space-x-2 animate-fadeIn z-50">
    <CheckCircle className="h-5 w-5" />
    <span>{message}</span>
  </div>
);

export default function EditServicePreference({ params }: { params: { orderId: string, preferenceType: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const { orderId, preferenceType } = params;
  
  // Map the route parameter to the actual preference type used in the data
  const getPreferenceFormName = (type: string) => {
    const mappings: Record<string, string> = {
      'secular': 'secularOrCivilPreference',
      'catholic': 'catholicPreference',
      'baptist': 'baptistPreference',
      'anglican': 'anglicanPreference',
      'uniting': 'unitingPreference'
    };
    
    return mappings[type.toLowerCase()] || '';
  };
  
  // Get the human-readable name for the preference type
  const getPreferenceDisplayName = (type: string) => {
    const mappings: Record<string, string> = {
      'secular': 'Secular/Civil',
      'catholic': 'Catholic',
      'baptist': 'Baptist',
      'anglican': 'Anglican',
      'uniting': 'Uniting'
    };
    
    return mappings[type.toLowerCase()] || '';
  };
  
  useEffect(() => {
    fetchOrderData();
  }, [orderId, preferenceType]);
  
  const fetchOrderData = async () => {
    try {
      setLoading(true);
      
      // Fetch order details
      const orderResponse = await axios.get(`/api/orders/${orderId}`);
      
      if (!orderResponse.data) {
        throw new Error('Order not found');
      }
      
      setOrderData(orderResponse.data);
      
      // Fetch form data
      const formResponse = await axios.get(`/api/forms/${orderId}`);
      
      if (formResponse.data.success && formResponse.data.formData) {
        const preferenceFormName = getPreferenceFormName(preferenceType);
        const existingData = formResponse.data.formData[preferenceFormName];
        setFormData(existingData || {});
      } else {
        // Initialize with empty object if no data found
        setFormData({});
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      setError('Could not load order data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission success
  const handleFormSuccess = () => {
    // Show notification
    setShowNotification(true);
    
    // Redirect to dashboard after a brief delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#3F72AF]" />
          <p className="text-[#3F72AF] font-medium">Loading service preferences...</p>
        </div>
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
      {showNotification && <SaveNotification message="Form saved successfully! Redirecting to dashboard..." />}
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Service Preferences
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {getPreferenceDisplayName(preferenceType)} Service for {orderData?.deceasedName}
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Pass the onSuccess callback to the form */}
        <div className="custom-form-wrapper" data-success-callback="handleFormSuccess">
          {renderPreferenceForm({
            preferenceType: preferenceType,
            existingData: formData,
            orderId: orderId,
            mode: "edit"
          })}
        </div>
      </div>
    </div>
  );
}