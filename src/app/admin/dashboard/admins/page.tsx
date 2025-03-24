'use client';

import { useState, useEffect } from 'react';
import { 
  Trash2, 
  UserPlus, 
  AlertCircle 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useAlert } from "@/_mycomponents/ui/alert-modal";

interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminManagement() {
  const { AlertComponent, showAlert } = useAlert();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin');
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to load administrators",
        variant: "error"
      });
    }
  };

  // Add new admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add admin');
      }

      // Reset form and fetch updated list
      setNewAdmin({ name: '', email: '', password: '' });
      await fetchAdmins();

      showAlert({
        title: "Success",
        message: "New administrator added successfully",
        variant: "success"
      });
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error.message,
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin?id=${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      await fetchAdmins();

      showAlert({
        title: "Success",
        message: "Administrator removed successfully",
        variant: "success"
      });
    } catch (error) {
      showAlert({
        title: "Error",
        message: "Failed to remove administrator",
        variant: "error"
      });
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      {/* Add the AlertComponent to render the modal */}
      <AlertComponent />

      <div>
        <h1 className="text-3xl font-bold">Administrator Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage and control administrative access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Admin List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Current Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove the administrator account. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Administrator
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Admin Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Administrator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Administrator'}
                <UserPlus className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}