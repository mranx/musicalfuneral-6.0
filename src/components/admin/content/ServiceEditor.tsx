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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Save,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  title: string;
  description: string;
  iconType: string;
  order: number;
  isActive: boolean;
}

export default function ServiceEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentService, setCurrentService] = useState<Service>({
    id: '',
    title: '',
    description: '',
    iconType: 'church',
    order: 0,
    isActive: true
  });

  const iconOptions = [
    'church', 'cross', 'bible', 'praying', 'candle', 'dove', 'heart', 'flower'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentService((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconChange = (value: string) => {
    setCurrentService((prev) => ({
      ...prev,
      iconType: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentService((prev) => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleAddService = async () => {
    if (!currentService.title || !currentService.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setProcessing(true);
      
      // Set the order to be last if not specified
      if (!currentService.order) {
        currentService.order = services.length > 0 
          ? Math.max(...services.map(service => service.order)) + 1 
          : 1;
      }

      const response = await fetch('/api/admin/content/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentService),
      });

      if (!response.ok) throw new Error('Failed to add service');
      
      const newService = await response.json();
      
      setServices((prev) => [...prev, newService]);
      resetForm();
      setShowAddDialog(false);
      toast.success('Service added successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error adding service:', error);
      toast.error('Failed to add service');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditService = async () => {
    if (!currentService.title || !currentService.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/services/${currentService.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentService),
      });

      if (!response.ok) throw new Error('Failed to update service');
      
      const updatedService = await response.json();
      
      setServices((prev) => 
        prev.map(service => service.id === updatedService.id ? updatedService : service)
      );
      
      setShowEditDialog(false);
      toast.success('Service updated successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete service');
      
      setServices((prev) => prev.filter(service => service.id !== id));
      toast.success('Service deleted successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = services.findIndex(service => service.id === id);
    if (index <= 0) return; // Already at the top
    
    try {
      const current = services[index];
      const previous = services[index - 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: previous.order };
      const updatedPrevious = { ...previous, order: current.order };
      
      // Update both services in the database
      await Promise.all([
        fetch(`/api/admin/content/services/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/services/${previous.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPrevious),
        })
      ]);
      
      // Update local state
      const updatedServices = [...services];
      updatedServices[index] = updatedCurrent;
      updatedServices[index - 1] = updatedPrevious;
      
      // Sort by order
      updatedServices.sort((a, b) => a.order - b.order);
      
      setServices(updatedServices);
      toast.success('Service order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating service order:', error);
      toast.error('Failed to update service order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = services.findIndex(service => service.id === id);
    if (index >= services.length - 1) return; // Already at the bottom
    
    try {
      const current = services[index];
      const next = services[index + 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: next.order };
      const updatedNext = { ...next, order: current.order };
      
      // Update both services in the database
      await Promise.all([
        fetch(`/api/admin/content/services/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/services/${next.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNext),
        })
      ]);
      
      // Update local state
      const updatedServices = [...services];
      updatedServices[index] = updatedCurrent;
      updatedServices[index + 1] = updatedNext;
      
      // Sort by order
      updatedServices.sort((a, b) => a.order - b.order);
      
      setServices(updatedServices);
      toast.success('Service order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating service order:', error);
      toast.error('Failed to update service order');
    }
  };

  const editService = (service: Service) => {
    setCurrentService(service);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setCurrentService({
      id: '',
      title: '',
      description: '',
      iconType: 'church',
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Services</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit or remove services you offer
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            These services appear in the services section of your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No services added yet</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="w-[100px]">Icon</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1">
                        <span>{service.order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(service.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(service.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{service.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {service.description}
                      </div>
                    </TableCell>
                    <TableCell>{service.iconType}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {service.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteService(service.id)}
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

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Add a new service to your services section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title</Label>
              <Input
                id="title"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
                placeholder="Enter service title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Service Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentService.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iconType">Icon Type</Label>
              <Select
                value={currentService.iconType}
                onValueChange={handleIconChange}
              >
                <SelectTrigger id="iconType">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={currentService.isActive}
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
              onClick={handleAddService}
              disabled={processing || !currentService.title || !currentService.description}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Service
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update this service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Service Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={currentService.title}
                onChange={handleInputChange}
                placeholder="Enter service title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Service Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={currentService.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-iconType">Icon Type</Label>
              <Select
                value={currentService.iconType}
                onValueChange={handleIconChange}
              >
                <SelectTrigger id="edit-iconType">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-isActive">Active</Label>
              <Switch
                id="edit-isActive"
                checked={currentService.isActive}
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
              onClick={handleEditService}
              disabled={processing || !currentService.title || !currentService.description}
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