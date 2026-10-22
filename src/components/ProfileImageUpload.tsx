'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
}

export default function ProfileImageUpload({ 
  userId, 
  currentImageUrl, 
  onUploadSuccess,
  onUploadError 
}: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file size (500KB = 512000 bytes)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      setError(`File size must be less than 500KB. Your file is ${(file.size / 1024).toFixed(0)}KB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload/profile-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setImageUrl(data.data.imageUrl);
      setPreviewUrl(data.data.imageUrl);
      onUploadSuccess(data.data.imageUrl);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload image';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
      // Reset preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/upload/profile-image/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove image');
      }

      setImageUrl(null);
      setPreviewUrl(null);
      onUploadSuccess('');
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove image';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Image Preview */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 128px, 160px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Buttons */}
      <div className="flex gap-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="profile-image-input"
        />
        <label
          htmlFor="profile-image-input"
          className={`px-1.5 py-0.5 bg-purple-600 text-white rounded text-[9px] font-medium cursor-pointer hover:bg-purple-700 transition-colors leading-none ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {imageUrl ? 'Update' : 'Upload'}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center max-w-xs">
          {error}
        </div>
      )}

      {/* File Size Info */}
      <p className="text-xs text-gray-500 text-center">
        Max file size: 500KB<br/>
        Allowed formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}
