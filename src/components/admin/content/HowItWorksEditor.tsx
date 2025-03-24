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
} from 'lucide-react';
import { toast } from 'sonner';

interface HowItWorksItem {
  id: string;
  step: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
}

export default function HowItWorksEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HowItWorksItem[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState<HowItWorksItem>({
    id: '',
    step: '',
    title: '',
    description: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/how-it-works');
      if (!response.ok) throw new Error('Failed to fetch how it works items');
      
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching how it works items:', error);
      toast.error('Failed to load how it works items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentItem((prev) => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleAddItem = async () => {
    if (!currentItem.step || !currentItem.title || !currentItem.description) {
      toast.error('Step number, title and description are required');
      return;
    }

    try {
      setProcessing(true);
      
      // Set the order to be last if not specified
      if (!currentItem.order) {
        currentItem.order = items.length > 0 
          ? Math.max(...items.map(item => item.order)) + 1 
          : 1;
      }

      const response = await fetch('/api/admin/content/how-it-works', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItem),
      });

      if (!response.ok) throw new Error('Failed to add how it works item');
      
      const newItem = await response.json();
      
      setItems((prev) => [...prev, newItem]);
      resetForm();
      setShowAddDialog(false);
      toast.success('How it works item added successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error adding how it works item:', error);
      toast.error('Failed to add how it works item');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditItem = async () => {
    if (!currentItem.step || !currentItem.title || !currentItem.description) {
      toast.error('Step number, title and description are required');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/how-it-works/${currentItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentItem),
      });

      if (!response.ok) throw new Error('Failed to update how it works item');
      
      const updatedItem = await response.json();
      
      setItems((prev) => 
        prev.map(item => item.id === updatedItem.id ? updatedItem : item)
      );
      
      setShowEditDialog(false);
      toast.success('How it works item updated successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating how it works item:', error);
      toast.error('Failed to update how it works item');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this how it works item?')) return;

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/how-it-works/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete how it works item');
      
      setItems((prev) => prev.filter(item => item.id !== id));
      toast.success('How it works item deleted successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error deleting how it works item:', error);
      toast.error('Failed to delete how it works item');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = items.findIndex(item => item.id === id);
    if (index <= 0) return; // Already at the top
    
    try {
      const current = items[index];
      const previous = items[index - 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: previous.order };
      const updatedPrevious = { ...previous, order: current.order };
      
      // Update both items in the database
      await Promise.all([
        fetch(`/api/admin/content/how-it-works/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/how-it-works/${previous.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPrevious),
        })
      ]);
      
      // Update local state
      const updatedItems = [...items];
      updatedItems[index] = updatedCurrent;
      updatedItems[index - 1] = updatedPrevious;
      
      // Sort by order
      updatedItems.sort((a, b) => a.order - b.order);
      
      setItems(updatedItems);
      toast.success('How it works item order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating how it works item order:', error);
      toast.error('Failed to update item order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = items.findIndex(item => item.id === id);
    if (index >= items.length - 1) return; // Already at the bottom
    
    try {
      const current = items[index];
      const next = items[index + 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: next.order };
      const updatedNext = { ...next, order: current.order };
      
      // Update both items in the database
      await Promise.all([
        fetch(`/api/admin/content/how-it-works/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/how-it-works/${next.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNext),
        })
      ]);
      
      // Update local state
      const updatedItems = [...items];
      updatedItems[index] = updatedCurrent;
      updatedItems[index + 1] = updatedNext;
      
      // Sort by order
      updatedItems.sort((a, b) => a.order - b.order);
      
      setItems(updatedItems);
      toast.success('How it works item order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating how it works item order:', error);
      toast.error('Failed to update item order');
    }
  };

  const editItem = (item: HowItWorksItem) => {
    setCurrentItem(item);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setCurrentItem({
      id: '',
      step: '',
      title: '',
      description: '',
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
        <p className="mt-2 text-gray-500">Loading how it works items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage How It Works</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit or remove steps explaining how your service works
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Step
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works Steps</CardTitle>
          <CardDescription>
            These steps appear in the how it works section of your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No steps added yet</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Step
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Step</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1">
                        <span>{item.step}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(item.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(item.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-sm text-gray-500 truncate">
                        {item.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {item.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteItem(item.id)}
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

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Step</DialogTitle>
            <DialogDescription>
              Add a new step to your how it works section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step">Step Number</Label>
              <Input
                id="step"
                name="step"
                value={currentItem.step}
                onChange={handleInputChange}
                placeholder="e.g., 01, 02, 03"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Step Title</Label>
              <Input
                id="title"
                name="title"
                value={currentItem.title}
                onChange={handleInputChange}
                placeholder="Enter step title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Step Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentItem.description}
                onChange={handleInputChange}
                placeholder="Enter step description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={currentItem.isActive}
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
              onClick={handleAddItem}
              disabled={processing || !currentItem.step || !currentItem.title || !currentItem.description}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add Step
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Update this how it works step
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-step">Step Number</Label>
              <Input
                id="edit-step"
                name="step"
                value={currentItem.step}
                onChange={handleInputChange}
                placeholder="e.g., 01, 02, 03"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Step Title</Label>
              <Input
                id="edit-title"
                name="title"
                value={currentItem.title}
                onChange={handleInputChange}
                placeholder="Enter step title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Step Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={currentItem.description}
                onChange={handleInputChange}
                placeholder="Enter step description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-isActive">Active</Label>
              <Switch
                id="edit-isActive"
                checked={currentItem.isActive}
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
              onClick={handleEditItem}
              disabled={processing || !currentItem.step || !currentItem.title || !currentItem.description}
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