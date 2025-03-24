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
  Upload,
  ChevronUp,
  ChevronDown,
  Video
} from 'lucide-react';
import { toast } from 'sonner';

interface DemoVideo {
  id: string;
  title: string;
  duration: string;
  src: string;
  thumbnail: string;
  order: number;
  isActive: boolean;
}

export default function VideoEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<DemoVideo>({
    id: '',
    title: '',
    duration: '',
    src: '',
    thumbnail: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/videos');
      if (!response.ok) throw new Error('Failed to fetch demo videos');
      
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching demo videos:', error);
      toast.error('Failed to load demo videos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentVideo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentVideo((prev) => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingThumbnail(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload thumbnail');
      }

      const data = await response.json();
      
      setCurrentVideo((prev) => ({
        ...prev,
        thumbnail: data.url
      }));
      
      toast.success('Thumbnail uploaded successfully');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size should be less than 50MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed');
      return;
    }

    setUploadingVideo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      const data = await response.json();
      
      setCurrentVideo((prev) => ({
        ...prev,
        src: data.url
      }));
      
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleAddVideo = async () => {
    if (!currentVideo.title || !currentVideo.src) {
      toast.error('Title and video source are required');
      return;
    }

    try {
      setProcessing(true);
      
      // Set the order to be last if not specified
      if (!currentVideo.order) {
        currentVideo.order = videos.length > 0 
          ? Math.max(...videos.map(video => video.order)) + 1 
          : 1;
      }

      const response = await fetch('/api/admin/content/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentVideo),
      });

      if (!response.ok) throw new Error('Failed to add demo video');
      
      const newVideo = await response.json();
      
      setVideos((prev) => [...prev, newVideo]);
      resetForm();
      setShowAddDialog(false);
      toast.success('Demo video added successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error adding demo video:', error);
      toast.error('Failed to add demo video');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditVideo = async () => {
    if (!currentVideo.title || !currentVideo.src) {
      toast.error('Title and video source are required');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/videos/${currentVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentVideo),
      });

      if (!response.ok) throw new Error('Failed to update demo video');
      
      const updatedVideo = await response.json();
      
      setVideos((prev) => 
        prev.map(video => video.id === updatedVideo.id ? updatedVideo : video)
      );
      
      setShowEditDialog(false);
      toast.success('Demo video updated successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating demo video:', error);
      toast.error('Failed to update demo video');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this demo video?')) return;

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/admin/content/videos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete demo video');
      
      setVideos((prev) => prev.filter(video => video.id !== id));
      toast.success('Demo video deleted successfully');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error deleting demo video:', error);
      toast.error('Failed to delete demo video');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveUp = async (id: string) => {
    const index = videos.findIndex(video => video.id === id);
    if (index <= 0) return; // Already at the top
    
    try {
      const current = videos[index];
      const previous = videos[index - 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: previous.order };
      const updatedPrevious = { ...previous, order: current.order };
      
      // Update both videos in the database
      await Promise.all([
        fetch(`/api/admin/content/videos/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCurrent),
        }),
        fetch(`/api/admin/content/videos/${previous.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPrevious),
        })
      ]);
      
      // Update local state
      const updatedVideos = [...videos];
      updatedVideos[index] = updatedCurrent;
      updatedVideos[index - 1] = updatedPrevious;
      
      // Sort by order
      updatedVideos.sort((a, b) => a.order - b.order);
      
      setVideos(updatedVideos);
      toast.success('Demo video order updated');
      
      // Refresh server-side cache
      router.refresh();
    } catch (error) {
      console.error('Error updating demo video order:', error);
      toast.error('Failed to update video order');
    }
  };

  const handleMoveDown = async (id: string) => {
    const index = videos.findIndex(video => video.id === id);
    if (index >= videos.length - 1) return; // Already at the bottom
    
    try {
      const current = videos[index];
      const next = videos[index + 1];
      
      // Swap orders
      const updatedCurrent = { ...current, order: next.order };
      const updatedNext = { ...next, order: current.order };
      
   // Update both videos in the database
   await Promise.all([
    fetch(`/api/admin/content/videos/${current.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCurrent),
    }),
    fetch(`/api/admin/content/videos/${next.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedNext),
    })
  ]);
  
  // Update local state
  const updatedVideos = [...videos];
  updatedVideos[index] = updatedCurrent;
  updatedVideos[index + 1] = updatedNext;
  
  // Sort by order
  updatedVideos.sort((a, b) => a.order - b.order);
  
  setVideos(updatedVideos);
  toast.success('Demo video order updated');
  
  // Refresh server-side cache
  router.refresh();
} catch (error) {
  console.error('Error updating demo video order:', error);
  toast.error('Failed to update video order');
}
};

const editVideo = (video: DemoVideo) => {
setCurrentVideo(video);
setShowEditDialog(true);
};

const resetForm = () => {
setCurrentVideo({
  id: '',
  title: '',
  duration: '',
  src: '',
  thumbnail: '',
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
    <p className="mt-2 text-gray-500">Loading demo videos...</p>
  </div>
);
}

return (
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold">Manage Demo Videos</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        Add, edit or remove video demonstrations
      </p>
    </div>
    <Button onClick={() => setShowAddDialog(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add New Video
    </Button>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Demo Videos</CardTitle>
      <CardDescription>
        These videos appear in the video demo section of your homepage
      </CardDescription>
    </CardHeader>
    <CardContent>
      {videos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No demo videos added yet</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Demo Video
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[120px]">Duration</TableHead>
              <TableHead className="w-[120px]">Thumbnail</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-1">
                    <span>{video.order}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveUp(video.id)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(video.id)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{video.title}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {video.src.split('/').pop()}
                  </div>
                </TableCell>
                <TableCell>{video.duration}</TableCell>
                <TableCell>
                  {video.thumbnail ? (
                    <div className="relative w-16 h-9 rounded overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-9 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Video className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    video.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                  }`}>
                    {video.isActive ? 'Active' : 'Hidden'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editVideo(video)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeleteVideo(video.id)}
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

  {/* Add Video Dialog */}
  <Dialog open={showAddDialog} onOpenChange={handleAddDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Demo Video</DialogTitle>
        <DialogDescription>
          Add a new video to your demo section
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            name="title"
            value={currentVideo.title}
            onChange={handleInputChange}
            placeholder="Enter video title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Video Duration</Label>
          <Input
            id="duration"
            name="duration"
            value={currentVideo.duration}
            onChange={handleInputChange}
            placeholder="e.g., 0:30 seconds"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="src">Video Source</Label>
          <div className="flex flex-col space-y-2">
            <Input
              id="src"
              name="src"
              value={currentVideo.src}
              onChange={handleInputChange}
              placeholder="e.g., /assets/videos/demo.mp4"
            />
            <Label htmlFor="videoUpload" className="cursor-pointer w-full">
              <div className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {uploadingVideo ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading video...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Video</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="videoUpload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
              disabled={uploadingVideo}
            />
            <p className="text-xs text-gray-500">
              Max file size: 50MB. Accepted formats: MP4, WebM
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              {currentVideo.thumbnail && (
                <div className="relative w-20 h-12 border rounded overflow-hidden">
                  <img 
                    src={currentVideo.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                id="thumbnail"
                name="thumbnail"
                value={currentVideo.thumbnail}
                onChange={handleInputChange}
                placeholder="e.g., /assets/images/thumbnail.jpg"
                className="flex-1"
              />
            </div>
            <Label htmlFor="thumbnailUpload" className="cursor-pointer w-full">
              <div className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {uploadingThumbnail ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading thumbnail...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload Thumbnail</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="thumbnailUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
              disabled={uploadingThumbnail}
            />
            <p className="text-xs text-gray-500">
              Recommended size: 640x360px (16:9). Max file size: 5MB
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={currentVideo.isActive}
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
          onClick={handleAddVideo}
          disabled={processing || !currentVideo.title || !currentVideo.src}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Add Video
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Edit Video Dialog */}
  <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Demo Video</DialogTitle>
        <DialogDescription>
          Update this demo video
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Video Title</Label>
          <Input
            id="edit-title"
            name="title"
            value={currentVideo.title}
            onChange={handleInputChange}
            placeholder="Enter video title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-duration">Video Duration</Label>
          <Input
            id="edit-duration"
            name="duration"
            value={currentVideo.duration}
            onChange={handleInputChange}
            placeholder="e.g., 0:30 seconds"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-src">Video Source</Label>
          <div className="flex flex-col space-y-2">
            <Input
              id="edit-src"
              name="src"
              value={currentVideo.src}
              onChange={handleInputChange}
              placeholder="e.g., /assets/videos/demo.mp4"
            />
            <Label htmlFor="edit-videoUpload" className="cursor-pointer w-full">
              <div className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {uploadingVideo ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading video...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload New Video</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="edit-videoUpload"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
              disabled={uploadingVideo}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-thumbnail">Thumbnail</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              {currentVideo.thumbnail && (
                <div className="relative w-20 h-12 border rounded overflow-hidden">
                  <img 
                    src={currentVideo.thumbnail} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <Input
                id="edit-thumbnail"
                name="thumbnail"
                value={currentVideo.thumbnail}
                onChange={handleInputChange}
                placeholder="e.g., /assets/images/thumbnail.jpg"
                className="flex-1"
              />
            </div>
            <Label htmlFor="edit-thumbnailUpload" className="cursor-pointer w-full">
              <div className="flex items-center justify-center p-2 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                {uploadingThumbnail ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Uploading thumbnail...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Upload New Thumbnail</span>
                  </div>
                )}
              </div>
            </Label>
            <Input
              id="edit-thumbnailUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailUpload}
              disabled={uploadingThumbnail}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="edit-isActive">Active</Label>
          <Switch
            id="edit-isActive"
            checked={currentVideo.isActive}
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
          onClick={handleEditVideo}
          disabled={processing || !currentVideo.title || !currentVideo.src}
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