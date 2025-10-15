'use client';

import React from 'react';
import { Upload, X, Trash2 } from 'lucide-react';

interface FileUploadSectionProps {
  profilePhoto: File | null;
  banner: File | null;
  profilePhotoPreview: string | null;
  bannerPreview: string | null;
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveProfilePhoto: () => void;
  onRemoveBanner: () => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  profilePhoto,
  banner,
  profilePhotoPreview,
  bannerPreview,
  onProfilePhotoChange,
  onBannerChange,
  onRemoveProfilePhoto,
  onRemoveBanner,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Profile Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Photo
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            {profilePhoto && (
              <button
                type="button"
                onClick={onRemoveProfilePhoto}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div>
            <input
              type="file"
              id="profilePhoto"
              accept="image/*"
              onChange={onProfilePhotoChange}
              className="hidden"
            />
            <label
              htmlFor="profilePhoto"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Banner Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-32 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-6 h-6 text-gray-400" />
              )}
            </div>
            {banner && (
              <button
                type="button"
                onClick={onRemoveBanner}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div>
            <input
              type="file"
              id="banner"
              accept="image/*"
              onChange={onBannerChange}
              className="hidden"
            />
            <label
              htmlFor="banner"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Banner
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG up to 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


