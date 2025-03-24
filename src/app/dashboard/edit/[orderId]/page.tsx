'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Save, Music } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

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
  specialRequests?: string;
  servicePlan: string;
  servicePrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  formData?: any;
}

export default function EditOrder({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // Form field states
  const [formData, setFormData] = useState({
    relation: '',
    directorName: '',
    directorCompany: '',
    directorEmail: '',
    deceasedName: '',
    dateOfBirth: '',
    dateOfPassing: '',
    serviceDate: '', // Add this line
    specialRequests: '',
    servicePlan: '',
    servicePrice: 0
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrder();
    }
  }, [status, params.orderId]);

  useEffect(() => {
    // Set the active tab based on URL parameter if provided
    const section = searchParams.get('section');
    if (section) {
      switch (section) {
        case 'service-plan':
          setActiveTab('service');
          break;
        case 'dates':
          setActiveTab('dates');
          break;
        case 'relationship':
          setActiveTab('relationship');
          break;
        case 'director':
          setActiveTab('director');
          break;
        case 'requests':
          setActiveTab('requests');
          break;
        default:
          setActiveTab('general');
      }
    }
  }, [searchParams]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      // Fetch order details
      const orderResponse = await axios.get(`/api/orders/${params.orderId}`);

      if (!orderResponse.data) {
        throw new Error('Order not found');
      }

      const orderData = orderResponse.data;

      // Fetch form data if available
      try {
        const formResponse = await axios.get(`/api/forms/${params.orderId}`);
        if (formResponse.data.success && formResponse.data.formData) {
          orderData.formData = formResponse.data.formData;
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }

      setOrder(orderData);
      const formatDateTimeForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
      };
      // Format dates for input fields (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        relation: orderData.relation || '',
        directorName: orderData.directorName || '',
        directorCompany: orderData.directorCompany || '',
        directorEmail: orderData.directorEmail || '',
        deceasedName: orderData.deceasedName || '',
        dateOfBirth: formatDateForInput(orderData.dateOfBirth),
        dateOfPassing: formatDateForInput(orderData.dateOfPassing),
        serviceDate: formatDateTimeForInput(orderData.serviceDate), // Add this line
        specialRequests: orderData.specialRequests || '',
        servicePlan: orderData.servicePlan || '',
        servicePrice: orderData.servicePrice || 0
      });
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await axios.put(`/api/orders/${params.orderId}`, formData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update order');
      }

      setSuccess('Order updated successfully');

      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  // Function to determine if user has a specific preference type
  const hasServicePreference = (type: string) => {
    if (!order?.formData) return false;
    return !!order.formData[type];
  };

  // Function to get preference type if any
  const getPreferenceType = () => {
    if (!order?.formData) return null;

    const preferenceTypes = [
      'catholicPreference',
      'baptistPreference',
      'secularOrCivilPreference',
      'anglicanPreference',
      'unitingPreference'
    ];

    for (const type of preferenceTypes) {
      if (order.formData[type]) {
        return type;
      }
    }

    return null;
  };

  // Format preference type name
  const formatPreferenceType = (type: string) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Preference', '')
      .trim();
  };

  const relationOptions = [
    "Son",
    "Daughter",
    "Father",
    "Mother",
    "Brother",
    "Sister",
    "Cousin",
    "Next of kin",
    "Executor"
  ];

  const servicePlans = [
    "Basic Plan",
    "Standard Plan",
    "Premium Plan"
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A77B5]"></div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-5xl mx-auto">
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Memorial Service
          </h1>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <p>{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <p>{error}</p>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Edit Order Information</CardTitle>
            <CardDescription>
              Update information about the memorial service for {order?.deceasedName}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="service">Service Plan</TabsTrigger>
                <TabsTrigger value="dates">Dates</TabsTrigger>
                <TabsTrigger value="director">Director</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                {/* General Information */}
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="deceasedName">Full Name of Deceased</Label>
                      <Input
                        id="deceasedName"
                        name="deceasedName"
                        value={formData.deceasedName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relation">Your Relationship</Label>
                      <Select
                        value={formData.relation}
                        onValueChange={(value) => handleSelectChange('relation', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relation" />
                        </SelectTrigger>
                        <SelectContent>
                          {relationOptions.map((relation) => (
                            <SelectItem key={relation} value={relation}>
                              {relation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {getPreferenceType() && (
                      <div className="mt-8 bg-blue-50 p-4 rounded-md">
                        <h3 className="text-lg font-medium text-blue-800 flex items-center">
                          <Music className="mr-2 h-5 w-5" />
                          Service Preferences
                        </h3>
                        <p className="text-blue-600 mt-2">
                          You have selected a <strong>{formatPreferenceType(getPreferenceType() || '')}</strong> service type.
                        </p>
                        <div className="mt-4">
                          <Link href={`/service-preferences/${order?.id}/${getPreferenceType()?.replace('Preference', '')}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Edit Service Preferences
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Service Plan */}
                <TabsContent value="service">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="servicePlan">Service Plan</Label>
                      <Select
                        value={formData.servicePlan}
                        onValueChange={(value) => handleSelectChange('servicePlan', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicePlans.map((plan) => (
                            <SelectItem key={plan} value={plan}>
                              {plan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicePrice">Service Price ($)</Label>
                      <Input
                        id="servicePrice"
                        name="servicePrice"
                        type="number"
                        value={formData.servicePrice}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Important Dates */}
                <TabsContent value="dates">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfPassing">Date of Passing</Label>
                        <Input
                          id="dateOfPassing"
                          name="dateOfPassing"
                          type="date"
                          value={formData.dateOfPassing}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* Add Service Date/Time Field */}
                      <div className="space-y-2 mt-6">
                        <Label htmlFor="serviceDate">Service Date & Time</Label>
                        <Input
                          id="serviceDate"
                          name="serviceDate"
                          type="datetime-local"
                          value={formData.serviceDate}
                          onChange={handleInputChange}
                        />

                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Funeral Director */}
                <TabsContent value="director">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="directorName">Funeral Director Name</Label>
                      <Input
                        id="directorName"
                        name="directorName"
                        value={formData.directorName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorCompany">Funeral Director Company</Label>
                      <Input
                        id="directorCompany"
                        name="directorCompany"
                        value={formData.directorCompany}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="directorEmail">Funeral Director Email</Label>
                      <Input
                        id="directorEmail"
                        name="directorEmail"
                        type="email"
                        value={formData.directorEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Special Requests */}
                <TabsContent value="requests">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialRequests">Special Requests or Instructions</Label>
                      <Textarea
                        id="specialRequests"
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Enter any special requests or instructions for the service"
                      />
                    </div>
                  </div>
                </TabsContent>

                <div className="flex justify-end space-x-4 mt-8">
                  <Link href="/dashboard">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>

                  <Button type="submit" disabled={saving} className="bg-[#3F72AF] hover:bg-[#2A5A8C]">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}