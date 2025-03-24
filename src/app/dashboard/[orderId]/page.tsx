'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

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
}

export default function EditOrder({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form field states
  const [formData, setFormData] = useState({
    relation: '',
    directorName: '',
    directorCompany: '',
    directorEmail: '',
    deceasedName: '',
    dateOfBirth: '',
    dateOfPassing: '',
    specialRequests: '',
    servicePlan: '',
    servicePrice: 0
  });
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrder();
    }
  }, [status, params.orderId]);
  
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${params.orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data);
      
      // Format dates for input fields (YYYY-MM-DD)
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        relation: data.relation || '',
        directorName: data.directorName || '',
        directorCompany: data.directorCompany || '',
        directorEmail: data.directorEmail || '',
        deceasedName: data.deceasedName || '',
        dateOfBirth: formatDateForInput(data.dateOfBirth),
        dateOfPassing: formatDateForInput(data.dateOfPassing),
        specialRequests: data.specialRequests || '',
        servicePlan: data.servicePlan || '',
        servicePrice: data.servicePrice || 0
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
      
      const response = await fetch(`/api/orders/${params.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order');
      }
      
      setSuccess('Order updated successfully');
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setSaving(false);
    }
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
        <div className="max-w-3xl mx-auto">
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Order
          </h1>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
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
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>
                Information about the service plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicePlan">Service Plan</Label>
                  <Select 
                    value={formData.servicePlan} 
                    onValueChange={(value) => handleSelectChange('servicePlan', value)}
                    disabled={order?.status !== 'pending'}
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
                  {order?.status !== 'pending' && (
                    <p className="text-sm text-amber-600 mt-1">
                      Service plan cannot be changed once processing has begun
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="relation">Your Relationship to Deceased</Label>
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
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Deceased Information</CardTitle>
              <CardDescription>
                Details about the deceased
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deceasedName">Full Name</Label>
                <Input
                  id="deceasedName"
                  name="deceasedName"
                  value={formData.deceasedName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Funeral Director Information</CardTitle>
              <CardDescription>
                Optional details about the funeral director
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="directorName">Name</Label>
                <Input
                  id="directorName"
                  name="directorName"
                  value={formData.directorName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="directorCompany">Company</Label>
                  <Input
                    id="directorCompany"
                    name="directorCompany"
                    value={formData.directorCompany}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="directorEmail">Email</Label>
                  <Input
                    id="directorEmail"
                    name="directorEmail"
                    type="email"
                    value={formData.directorEmail}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Special requests or instructions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
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
      </div>
    </div>
  );
}