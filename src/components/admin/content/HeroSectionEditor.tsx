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

export default function HeroSectionEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [heroContent, setHeroContent] = useState({
    id: '',
    sectionName: 'hero',
    title: '',
    description: '',
    videoUrl: '',
    imageUrl: '',
    buttonText1: '',
    buttonLink1: '',
    buttonText2: '',
    buttonLink2: '',
    order: 1,
    isActive: true
  });
  const [originalContent, setOriginalContent] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/api/admin/content/sections');
        const sections = await response.json();
        
        const heroSection = sections.find((section: any) => 
          section.sectionName === 'hero'
        );
        
        if (heroSection) {
          const content = {
            id: heroSection.id,
            sectionName: heroSection.sectionName,
            title: heroSection.title || '',
            description: heroSection.description || '',
            videoUrl: heroSection.videoUrl || '',
            imageUrl: heroSection.imageUrl || '',
            buttonText1: heroSection.buttonText ? heroSection.buttonText.split(',')[0] : '',
            buttonLink1: heroSection.buttonLink ? heroSection.buttonLink.split(',')[0] : '',
            buttonText2: heroSection.buttonText ? heroSection.buttonText.split(',')[1] || '' : '',
            buttonLink2: heroSection.buttonLink ? heroSection.buttonLink.split(',')[1] || '' : '',
            order: heroSection.order || 1,
            isActive: heroSection.isActive
          };
          
          setHeroContent(content);
          setOriginalContent(content);
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
        toast.error('Failed to load hero section content');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  useEffect(() => {
    // Check for unsaved changes
    setUnsavedChanges(JSON.stringify(heroContent) !== JSON.stringify(originalContent));
  }, [heroContent, originalContent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setHeroContent((prev) => ({
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
      
      setHeroContent((prev) => ({
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
      // Format data for API
      const apiData = {
        sectionName: 'hero',
        title: heroContent.title,
        description: heroContent.description,
        videoUrl: heroContent.videoUrl,
        imageUrl: heroContent.imageUrl,
        buttonText: `${heroContent.buttonText1},${heroContent.buttonText2}`.replace(/^,|,$/g, ''),
        buttonLink: `${heroContent.buttonLink1},${heroContent.buttonLink2}`.replace(/^,|,$/g, ''),
        order: heroContent.order,
        isActive: heroContent.isActive
      };

      let response;
      
      if (heroContent.id) {
        // Update existing content
        response = await fetch(`/api/admin/content/sections/${heroContent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
      } else {
        // Create new content
        response = await fetch('/api/admin/content/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save hero content');
      }

      const savedData = await response.json();
      
      // Update local state with saved data
      const updatedContent = {
        id: savedData.id,
        sectionName: savedData.sectionName,
        title: savedData.title || '',
        description: savedData.description || '',
        videoUrl: savedData.videoUrl || '',
        imageUrl: savedData.imageUrl || '',
        buttonText1: savedData.buttonText ? savedData.buttonText.split(',')[0] || '' : '',
        buttonLink1: savedData.buttonLink ? savedData.buttonLink.split(',')[0] || '' : '',
        buttonText2: savedData.buttonText ? savedData.buttonText.split(',')[1] || '' : '',
        buttonLink2: savedData.buttonLink ? savedData.buttonLink.split(',')[1] || '' : '',
        order: savedData.order || 1,
        isActive: savedData.isActive
      };
      
      setHeroContent(updatedContent);
      setOriginalContent(updatedContent);
      setUnsavedChanges(false);
      
      toast.success('Hero section saved successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to save hero section');
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
        <p className="mt-2 text-gray-500">Loading hero section content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Hero Section</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Update the main hero section that appears at the top of your homepage
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
            <CardTitle>Hero Content</CardTitle>
            <CardDescription>
              The main heading and description that visitors see first
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Heading</Label>
              <Input
                id="title"
                name="title"
                value={heroContent.title}
                onChange={handleInputChange}
                placeholder="Enter main heading"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={heroContent.description}
                onChange={handleInputChange}
                placeholder="Enter description text"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>
              Hero image and video content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUpload">Hero Image</Label>
              <div className="flex items-center space-x-4">
                {heroContent.imageUrl && (
                  <div className="relative w-24 h-24 border rounded overflow-hidden">
                    <img 
                      src={heroContent.imageUrl} 
                      alt="Hero" 
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
                        <span>{heroContent.imageUrl ? 'Change Image' : 'Upload Image'}</span>
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
                Recommended size: 1200x600px, max 5MB
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                name="videoUrl"
                value={heroContent.videoUrl}
                onChange={handleInputChange}
                placeholder="e.g., /assets/videos/intro.mp4"
              />
              <p className="text-xs text-gray-500">
                Enter relative path to video file (should be in public directory)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Button</CardTitle>
            <CardDescription>
              Main call-to-action button
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText1">Button Text</Label>
              <Input
                id="buttonText1"
                name="buttonText1"
                value={heroContent.buttonText1}
                onChange={handleInputChange}
                placeholder="e.g., Our Services"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonLink1">Button Link</Label>
              <Input
                id="buttonLink1"
                name="buttonLink1"
                value={heroContent.buttonLink1}
                onChange={handleInputChange}
                placeholder="e.g., /services"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secondary Button</CardTitle>
            <CardDescription>
              Optional secondary call-to-action button
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buttonText2">Button Text</Label>
              <Input
                id="buttonText2"
                name="buttonText2"
                value={heroContent.buttonText2}
                onChange={handleInputChange}
                placeholder="e.g., Contact Us"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonLink2">Button Link</Label>
              <Input
                id="buttonLink2"
                name="buttonLink2"
                value={heroContent.buttonLink2}
                onChange={handleInputChange}
                placeholder="e.g., /contact"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      <AlertDialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Hero Section Preview</AlertDialogTitle>
            <AlertDialogDescription>
              Here's how your hero section will look on the website
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 my-4">
            <div className="flex flex-col items-center space-y-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                {heroContent.title || "Your Hero Title Will Appear Here"}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                {heroContent.description || "Your hero description will appear here. This text helps visitors understand what your website is about at a glance."}
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {heroContent.buttonText1 && (
                  <button className="px-6 py-3 rounded-md bg-[#4A77B5] text-white font-medium">
                    {heroContent.buttonText1}
                  </button>
                )}
                {heroContent.buttonText2 && (
                  <button className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 font-medium">
                    {heroContent.buttonText2}
                  </button>
                )}
              </div>
              {(heroContent.imageUrl || heroContent.videoUrl) && (
                <div className="w-full max-w-4xl mt-8 aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {heroContent.videoUrl ? (
                    <p className="text-gray-500">[Video Player: {heroContent.videoUrl}]</p>
                  ) : heroContent.imageUrl ? (
                    <img 
                      src={heroContent.imageUrl} 
                      alt="Hero preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}
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