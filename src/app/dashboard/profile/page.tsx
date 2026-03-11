'use client';

import { useApp } from '@/contexts/app-provider';
import { ProfileForm } from '@/components/dashboard/profile-form';

export default function ProfilePage() {
  const { profile, setProfile } = useApp();

  return (
    <div>
      <ProfileForm existingProfile={profile} onSave={setProfile} />
    </div>
  );
}
