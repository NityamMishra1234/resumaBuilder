'use client';

import { useApp } from '@/contexts/app-provider';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, setProfile, isLoadingProfile } = useApp();

  // Wait for the context to finish its initial data fetch
  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Master Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your personal information, experience, and skills.
        </p>
      </div>
      
      {/* Note: You may still need to use the normalizeProfileData function from our previous 
        conversation inside the ProfileForm itself, or cast it, if Zod expects missing IDs.
      */}
      <ProfileForm existingProfile={profile as any} onSave={setProfile} />
    </div>
  );
}
