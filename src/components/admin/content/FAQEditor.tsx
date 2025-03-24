'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
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
  DialogTrigger,
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
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export default function FAQEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FAQ>({
    id: '',
    question: '',
    answer: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/faqs');
      if (!response.ok) throw new Error('Failed to fetch FAQs');
      
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentFaq((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentFaq((prev) => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleAddFAQ = async () => {
    if (!currentFaq.question || !currentFaq.answer) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      setProcessing(true);
      
      // Set the order to be last if not specified
      if (!currentFaq.order) {
        currentFaq.order = faqs.length > 0 
          ? Math.max(...faqs.map(faq => faq.order)) + 1 
          : 1;
      }

      const response = await fetch('/api/admin/content/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentFaq),
      });

      if (!response.ok) throw new Error('Failed to add FAQ');
      
      const newFaq = await response.json();
      
      setFaqs((prev) => [...prev, newFaq]);
      resetForm();
      setShowAddDialog(false);
      toast.success('FAQ added successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Failed to add FAQ');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditFAQ = async () => {
    if (!currentFaq.question || !currentFaq.answer) {
      toast.error('Question and answer are required');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/faqs/${currentFaq.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentFaq),
      });

      if (!response.ok) throw new Error('Failed to update FAQ');
      
      const updatedFaq = await response.json();
      
      setFaqs((prev) => 
        prev.map(faq => faq.id === updatedFaq.id ? updatedFaq : faq)
      );
      
      setShowEditDialog(false);
      toast.success('FAQ updated successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/faqs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete FAQ');
      
      setFaqs((prev) => prev.filter(faq => faq.id !== id));
      toast.success('FAQ deleted successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = faqs.findIndex(faq => faq.id === id);
    if (index <= 0) return; // Already at the top
    
    try {
      const current = faqs[index];
      const previous = faqs[index - 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: previous.order };
      const updatedPrevious = { ...previous, order: current.order };
      
      // Update both FAQs in the database
      await Promise.all([
        fetch(`/api/admin/content/faqs/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/faqs/${previous.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPrevious),
        })
      ]);
      
      // Update local state
      const updatedFaqs = [...faqs];
      updatedFaqs[index] = updatedCurrent;
      updatedFaqs[index - 1] = updatedPrevious;
      
      // Sort by order
      updatedFaqs.sort((a, b) => a.order - b.order);
      
      setFaqs(updatedFaqs);
      toast.success('FAQ order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      toast.error('Failed to update FAQ order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = faqs.findIndex(faq => faq.id === id);
    if (index >= faqs.length - 1) return; // Already at the bottom
    
    try {
      const current = faqs[index];
      const next = faqs[index + 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: next.order };
      const updatedNext = { ...next, order: current.order };
      
      // Update both FAQs in the database
      await Promise.all([
        fetch(`/api/admin/content/faqs/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/faqs/${next.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNext),
        })
      ]);
      
      // Update local state
      const updatedFaqs = [...faqs];
      updatedFaqs[index] = updatedCurrent;
      updatedFaqs[index + 1] = updatedNext;
      
      // Sort by order
      updatedFaqs.sort((a, b) => a.order - b.order);
      
      setFaqs(updatedFaqs);
      toast.success('FAQ order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating FAQ order:', error);
      toast.error('Failed to update FAQ order');
    }
  };

  const editFAQ = (faq: FAQ) => {
    setCurrentFaq(faq);
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setCurrentFaq({
      id: '',
      question: '',
      answer: '',
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
        <p className="mt-2 text-gray-500">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage FAQs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit or remove frequently asked questions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            These questions and answers appear in the FAQ section of your homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No FAQs added yet</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First FAQ
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-1">
                        <span>{faq.order}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveUp(faq.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move up"
                          >
                            <MoveUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(faq.id)}
                            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Move down"
                          >
                            <MoveDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{faq.question}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {faq.answer}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        faq.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {faq.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editFAQ(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteFAQ(faq.id)}
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

      {/* Add FAQ Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>
              Add a new question and answer to your FAQ section
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                name="question"
                value={currentFaq.question}
                onChange={handleInputChange}
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                name="answer"
                value={currentFaq.answer}
                onChange={handleInputChange}
                placeholder="Enter the answer"
                rows={5}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={currentFaq.isActive}
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
              onClick={handleAddFAQ}
              disabled={processing || !currentFaq.question || !currentFaq.answer}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Add FAQ
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update this question and answer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                name="question"
                value={currentFaq.question}
                onChange={handleInputChange}
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                name="answer"
                value={currentFaq.answer}
                onChange={handleInputChange}
                placeholder="Enter the answer"
                rows={5}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="edit-isActive">Active</Label>
              <Switch
                id="edit-isActive"
                checked={currentFaq.isActive}
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
              onClick={handleEditFAQ}
              disabled={processing || !currentFaq.question || !currentFaq.answer}
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