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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, AlertTriangle, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function AboutSectionEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [aboutContent, setAboutContent] = useState({
    id: '',
    sectionName: 'about',
    title: '',
    description: '',
    imageUrl: '',
    order: 3,
    isActive: true
  });
  const [originalContent, setOriginalContent] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/api/admin/content/sections');
        const sections = await response.json();
        
        const aboutSection = sections.find((section: any) => 
          section.sectionName === 'about'
        );
        
        if (aboutSection) {
          setAboutContent(aboutSection);
          setOriginalContent(aboutSection);
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        toast.error('Failed to load about section content');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  useEffect(() => {
    // Check for unsaved changes
    setUnsavedChanges(JSON.stringify(aboutContent) !== JSON.stringify(originalContent));
  }, [aboutContent, originalContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAboutContent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      setAboutContent((prev) => ({
        ...prev,
        imageUrl: data.url
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      let response;
      
      if (aboutContent.id) {
        // Update existing content
        response = await fetch(`/api/admin/content/sections/${aboutContent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aboutContent),
        });
      } else {
        // Create new content
        response = await fetch('/api/admin/content/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aboutContent),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save about content');
      }

      const savedData = await response.json();
      
      // Update local state with saved data
      setAboutContent(savedData);
      setOriginalContent(savedData);
      setUnsavedChanges(false);
      
      toast.success('About section saved successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Failed to save about section');
    } finally {
      setSaving(false);
    }
  };

  const previewContent = () => {
    setShowPreviewDialog(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-gray-500">Loading about section content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit About Section</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update the about section that appears on your homepage
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={previewContent}
            disabled={saving}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !unsavedChanges}
          >
            {saving ? (
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
        </div>
      </div>

      {unsavedChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800 dark:text-amber-300">You have unsaved changes</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Make sure to save your changes before leaving this page.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About Section Content</CardTitle>
            <CardDescription>
              The main heading and description for your about section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Heading</Label>
              <Input
                id="title"
                name="title"
                value={aboutContent.title}
                onChange={handleInputChange}
                placeholder="Enter about section heading"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={aboutContent.description}
                onChange={handleInputChange}
                placeholder="Enter description text"
                rows={10}
              />
              <p className="text-xs text-gray-500">
                Use a blank line (two enters) to create paragraphs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About Image</CardTitle>
            <CardDescription>
              Image to display in the about section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUpload">About Image</Label>
              <div className="flex items-center space-x-4">
                {aboutContent.imageUrl && (
                  <div className="relative w-32 h-32 border rounded overflow-hidden">
                    <img 
                      src={aboutContent.imageUrl} 
                      alt="About" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Label 
                    htmlFor="imageUpload" 
                    className="cursor-pointer flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    {uploadingImage ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Upload className="mr-2 h-4 w-4" />
                        <span>{aboutContent.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Recommended size: 600x800px, max 5MB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>About Section Preview</AlertDialogTitle>
            <AlertDialogDescription>
              Here's how your about section will look on the website
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 my-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {aboutContent.title || "About Us"}
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  {aboutContent.description ? (
                    aboutContent.description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <p className="mb-6">
                      No description provided yet. The description will appear here.
                    </p>
                  )}
                </div>
              </div>
              <div className="relative aspect-[4/3] w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                {aboutContent.imageUrl ? (
                  <img 
                    src={aboutContent.imageUrl} 
                    alt="About preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No image uploaded
                  </div>
                )}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close Preview</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave} disabled={saving || !unsavedChanges}>
              {saving ? 'Saving...' : 'Save Changes'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}