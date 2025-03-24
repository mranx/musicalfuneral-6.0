"use client";

import React, { useEffect, useState } from 'react';
import CustomVideoPlayer from '@/_mycomponents/video/CustomVideoPlayer';
import axios from 'axios';

const FinalVideoPage = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const videoList = [
    {
      id: "1",
      title: "Introduction Video",
      src: "/assets/videos/test.mp4",
      thumbnail: "/assets/images/thumbnail.jpg"
    },
    {
      id: "2",
      title: "Product Demo",
      src: "/assets/videos/Sample Video.mp4",
      thumbnail: "/assets/images/thumbnail.jpg"
    }
  ];

  // Fetch form data using the cookie
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        // Use the 'current' endpoint which will use the cookie
        const response = await axios.get('/api/forms/current');
        if (response.data.success) {
          setFormData(response.data.formData);
          
          // Get the orderId from the response
          if (response.data.orderId) {
            setOrderId(response.data.orderId);
            
            // Set order as completed - include the orderId to ensure the correct record is updated
            await axios.put('/api/forms/update', {
              orderId: response.data.orderId,
              formName: 'status',
              formData: { isCompleted: true }
            });
          }
        } else {
          throw new Error('Failed to load form data');
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setVideoError("Failed to load your order data. Please return to the service selection page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, []);

  useEffect(() => {
    const validateAssets = async () => {
      try {
        setIsLoading(true);
        setVideoError(null);

        const initialVideo = videoList[0];
        if (!initialVideo) {
          throw new Error("No videos available");
        }

        const checkPaths = async () => {
          for (const video of videoList) {
            const imgResponse = await fetch(video.thumbnail);
            if (!imgResponse.ok) {
              throw new Error(`Thumbnail not found for video: ${video.title}`);
            }

            const videoResponse = await fetch(video.src);
            if (!videoResponse.ok) {
              throw new Error(`Video file not found: ${video.title}`);
            }
          }
        };

        await checkPaths();
        setIsLoading(false);
      } catch (error) {
        setVideoError(error instanceof Error ? error.message : "Failed to load video assets");
        setIsLoading(false);
      }
    };

    validateAssets();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      }

      const updateOnlineStatus = () => {
        setIsOnline(navigator.onLine);
      };

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full border-t-4 border-8 h-16 w-16 mx-auto mb-4" style={{ borderTopColor: '#3F72AF' }} ></div>
          <p className="text-gray-600">Loading video assets...</p>
        </div>
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-center text-red-600">
            Error loading video: {videoError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl shadow-lg mb-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Final Video</h1>

      {orderId && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-center">
            <span className="font-bold text-blue-600">Order ID:</span> {orderId}
          </p>
        </div>
      )}

      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <p className="text-center">
          <span className="font-bold text-red-600">NOTE:</span>{" "}
          This is a one-time view only, if you closed this tab, video will be deleted and you will have to order it again
        </p>
      </div>

      {videoList.length > 0 && (
        <div className="rounded-lg overflow-hidden shadow-lg">
          <CustomVideoPlayer 
            videoList={videoList}
            initialVideo={videoList[0]}
          />
        </div>
      )}

      <div className="mt-4 text-center">
        {isOnline ? (
          <p className="text-green-600">You are online. Video is ready for offline playback.</p>
        ) : (
          <p className="text-red-600">You are offline. Playing video from cache.</p>
        )}
      </div>
    </div>
  );
};

export default FinalVideoPage;