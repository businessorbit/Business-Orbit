"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PlusCircle, Calendar, Upload, AlertCircle, Image, Video, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { safeApiCall } from "@/lib/utils/api";

interface PostCardProps {
  onPostCreated?: () => void;
}

interface DailyStatus {
  canPost: boolean;
  dailyPostCount: number;
  maxPostsPerDay: number;
  remainingPosts: number;
  nextPostAllowedAt: string;
  message: string;
}

export default function PostCard({ onPostCreated }: PostCardProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<any[]>([]);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [error, setError] = useState<string>("");
  const [showPostCard, setShowPostCard] = useState(false);
  const [postType, setPostType] = useState<'post' | 'schedule'>('post');
  const [activeButton, setActiveButton] = useState<'post' | 'schedule' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Fetch daily post status on component mount
  // useEffect(() => {
  //   fetchDailyStatus();
  // }, []);

  // const fetchDailyStatus = async () => {
  //   try {
  //     const result = await safeApiCall(
  //       () => fetch('/api/posts/daily-status', {
  //         credentials: 'include',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         }
  //       }),
  //       'Failed to fetch daily status'
  //     );

  //     if (result.success && result.data) {
  //       setDailyStatus(result.data as DailyStatus);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching daily status:', error);
  //   }
  // };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(prev => {
        const newFiles = [...prev, ...selectedFiles].slice(0, 2); // Max 2 files
        return newFiles;
      });
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const handlePostClick = () => {
    setPostType('post');
    setActiveButton('post');
    setShowPostCard(true);
  };

  const handleScheduleClick = () => {
    setPostType('schedule');
    setActiveButton('schedule');
    setShowPostCard(true);
  };

  const handleClosePostCard = () => {
    setShowPostCard(false);
    setActiveButton(null);
    setContent("");
    setFiles([]);
    setUploadedMedia([]);
    setScheduledAt("");
    setError("");
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const result = await safeApiCall(
      () => fetch('/api/posts/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }),
      'Failed to upload files'
    );

    if (result.success) {
      const mediaArray = (result.data as any)?.data || result.data || [];
      setUploadedMedia(mediaArray as any[]);
      return mediaArray as any[];
    }
    return [];
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    
    // Check daily limit before proceeding
    // if (dailyStatus && !dailyStatus.canPost) {
    //   setError('Daily post limit reached. You can only post once per day to encourage thoughtful content.');
    //   return;
    // }
    
    setIsSubmitting(true);
    setError("");
    try {
      // Upload files first if any
      const uploadResult = files.length > 0 ? await uploadFiles() : [];
      const media = Array.isArray(uploadResult) ? uploadResult : [];

      // Create post
      const result = await safeApiCall(
        () => fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: content.trim(),
            scheduledAt: scheduledAt || null,
            media
          }),
        }),
        'Failed to create post'
      );

      if (result.success) {
        // Reset form
        setContent("");
        setScheduledAt("");
        setFiles([]);
        setUploadedMedia([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Refresh daily status
        // await fetchDailyStatus();
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        // Handle specific error cases
        // if ((result.error as any)?.code === 'DAILY_LIMIT_REACHED') {
        //   setError((result.error as any).error || 'Daily post limit reached.');
        //   await fetchDailyStatus(); // Refresh status
        // } else {
          setError(result.error || 'Failed to create post');
        // }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!content.trim() || !scheduledAt) return;
    
    setIsSubmitting(true);
    setError("");
    try {
      // Upload files first if any
      const uploadResult = files.length > 0 ? await uploadFiles() : [];
      const media = Array.isArray(uploadResult) ? uploadResult : [];

      // Create scheduled post
      const result = await safeApiCall(
        () => fetch('/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: content.trim(),
            scheduledAt: scheduledAt,
            media
          }),
        }),
        'Failed to schedule post'
      );

      if (result.success) {
        // Reset form
        setContent("");
        setScheduledAt("");
        setFiles([]);
        setUploadedMedia([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Refresh daily status
        // await fetchDailyStatus();
        
        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        // Handle specific error cases
        // if ((result.error as any)?.code === 'DAILY_LIMIT_REACHED') {
        //   setError((result.error as any).error || 'Daily post limit reached.');
        //   await fetchDailyStatus(); // Refresh status
        // } else {
          setError(result.error || 'Failed to schedule post');
        // }
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      setError('Failed to schedule post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-4">
      {/* Always Visible Action Buttons */}
      <div className="flex justify-start gap-3">
        <Button
          onClick={handlePostClick}
          className={`px-6 ${
            activeButton === 'post' 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Post
        </Button>
        <Button
          onClick={handleScheduleClick}
          className={`px-6 ${
            activeButton === 'schedule' 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-white text-black border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </div>

      {/* Post Creation Card - Only shown when Post/Schedule is clicked */}
      {showPostCard && (
        <Card className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Text Input */}
            <Textarea
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 focus:border-gray-400"
              maxLength={2000}
            />

            {/* Media Upload Icons */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImageUpload}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Image className="h-5 w-5" />
                <span className="text-sm">Image</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleVideoUpload}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <Video className="h-5 w-5" />
                <span className="text-sm">Video</span>
              </Button>

              {/* Show selected files */}
              {files.length > 0 && (
                <div className="flex gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <span className="text-xs text-gray-600">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date and Time Picker - Only for Schedule */}
            {postType === 'schedule' && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="flex-1"
                  placeholder="dd-mm-yyyy --:--"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={handleClosePostCard}
                variant="outline"
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={postType === 'post' ? handlePost : handleSchedule}
                disabled={!content.trim() || isSubmitting || (postType === 'schedule' && !scheduledAt)}
                className="px-6 bg-black text-white hover:bg-gray-800"
              >
                <Clock className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
