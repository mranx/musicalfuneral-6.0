'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  ChevronUp,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
  features: string;
  order: number;
  isActive: boolean;
}

export default function PricingEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PricingPlan>({
    id: '',
    title: '',
    price: 0,
    features: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing plans');
      
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Handle price as a number
      const numValue = parseFloat(value) || 0;
      setCurrentPlan((prev) => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setCurrentPlan((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentPlan((prev) => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleAddPlan = async () => {
    if (!currentPlan.title || currentPlan.price <= 0) {
      toast.error('Title and a valid price are required');
      return;
    }

    try {
      setProcessing(true);
      
      // Set the order to be last if not specified
      if (!currentPlan.order) {
        currentPlan.order = plans.length > 0 
          ? Math.max(...plans.map(plan => plan.order)) + 1 
          : 1;
      }

      const response = await fetch('/api/admin/content/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPlan),
      });

      if (!response.ok) throw new Error('Failed to add pricing plan');
      
      const newPlan = await response.json();
      
      setPlans((prev) => [...prev, newPlan]);
      resetForm();
      setShowAddDialog(false);
      toast.success('Pricing plan added successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error adding pricing plan:', error);
      toast.error('Failed to add pricing plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditPlan = async () => {
    if (!currentPlan.title || currentPlan.price <= 0) {
      toast.error('Title and a valid price are required');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/pricing/${currentPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPlan),
      });

      if (!response.ok) throw new Error('Failed to update pricing plan');
      
      const updatedPlan = await response.json();
      
      setPlans((prev) => 
        prev.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
      );
      
      setShowEditDialog(false);
      toast.success('Pricing plan updated successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      toast.error('Failed to update pricing plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/pricing/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete pricing plan');
      
      setPlans((prev) => prev.filter(plan => plan.id !== id));
      toast.success('Pricing plan deleted successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      toast.error('Failed to delete pricing plan');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = plans.findIndex(plan => plan.id === id);
    if (index <= 0) return; // Already at the top
    
    try {
      const current = plans[index];
      const previous = plans[index - 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: previous.order };
      const updatedPrevious = { ...previous, order: current.order };
      
      // Update both plans in the database
      await Promise.all([
        fetch(`/api/admin/content/pricing/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/pricing/${previous.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPrevious),
        })
      ]);
      
      // Update local state
      const updatedPlans = [...plans];
      updatedPlans[index] = updatedCurrent;
      updatedPlans[index - 1] = updatedPrevious;
      
      // Sort by order
      updatedPlans.sort((a, b) => a.order - b.order);
      
      setPlans(updatedPlans);
      toast.success('Pricing plan order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating pricing plan order:', error);
      toast.error('Failed to update pricing plan order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = plans.findIndex(plan => plan.id === id);
    if (index >= plans.length - 1) return; // Already at the bottom
    
    try {
      const current = plans[index];
      const next = plans[index + 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: next.order };
      const updatedNext = { ...next, order: current.order };
      
      // Update both plans in the database
      await Promise.all([
        fetch(`/api/admin/content/pricing/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/pricing/${next.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNext),
        })
      ]);
      
      // Update local state
      const updatedPlans = [...plans];
      updatedPlans[index] = updatedCurrent;
      updatedPlans[index + 1] = updatedNext;
      
      // Sort by order
      updatedPlans.sort((a, b) => a.order - b.order);
      
      setPlans(updatedPlans);
      toast.success('Pricing plan order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating pricing plan order:', error);
      toast.error('Failed to update pricing plan order');
    }
  };

  const editPlan = (plan: PricingPlan) => {
    setCurrentPlan(plan);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setCurrentPlan({
      id: '',
      title: '',
      price: 0,
      features: '',
      order: 0,
      isActive: true
    });
  };

  const handleAddDialogOpen = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) resetForm();
  };

  const handleEditDialogOpen = (open: boolean) => {
    setShowEditDialog(open);
    if (!open) resetForm();
  };

  // Helper function to format features for display
  const formatFeatures = (features: string) => {
    const featureList = features.split('|');
    if (featureList.length <= 1) {
      return features;
    }
    return featureList.join(', ');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Loading pricing plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Pricing Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit or remove pricing plans
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>
            These pricing plans appear in the pricing section of your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No pricing plans added yet</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Pricing Plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="w-[100px]">Price</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1">
                        <span>{plan.order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(plan.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(plan.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{plan.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {formatFeatures(plan.features)}
                      </div>
                    </TableCell>
                    <TableCell>${typeof plan.price === 'number' ? plan.price.toFixed(2) : parseFloat(plan.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {plan.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeletePlan(plan.id)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Plan Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Pricing Plan</DialogTitle>
            <DialogDescription>
              Add a new pricing plan to your pricing section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plan Title</Label>
              <Input
                id="title"
                name="title"
                value={currentPlan.title}
                onChange={handleInputChange}
                placeholder="Enter plan title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPlan.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">
                Features (one per line or separated by | character)
              </Label>
              <Textarea
                id="features"
                name="features"
                value={currentPlan.features}
                onChange={handleInputChange}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={5}
              />
              <p className="text-xs text-gray-500">
                Each line or item separated by | will be displayed as a separate feature
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={currentPlan.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPlan}
              disabled={processing || !currentPlan.title || currentPlan.price <= 0}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>
              Update this pricing plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Plan Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={currentPlan.title}
                onChange={handleInputChange}
                placeholder="Enter plan title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={currentPlan.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-features">
                Features (one per line or separated by | character)
              </Label>
              <Textarea
                id="edit-features"
                name="features"
                value={currentPlan.features}
                onChange={handleInputChange}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={5}
              />
              <p className="text-xs text-gray-500">
                Each line or item separated by | will be displayed as a separate feature
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-isActive">Active</Label>
              <Switch
                id="edit-isActive"
                checked={currentPlan.isActive}
                onCheckedChange={handleSwitchChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPlan}
              disabled={processing || !currentPlan.title || currentPlan.price <= 0}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}