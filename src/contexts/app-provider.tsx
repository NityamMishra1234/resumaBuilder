'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GeneratedResume } from '@/lib/types';
import { Flag } from '@/components/ui/flag';
import { Profile, GetProfileResponse } from '@/types/profile.type'; // Your new types
import api from '@/api/api';
import { useAuth } from '@/providers/AuthProvider';

type FlagType = 'success' | 'error' | 'info';

interface FlagState {
  message: string;
  type: FlagType;
  visible: boolean;
}

interface AppContextType {
  // Profile State
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  isLoadingProfile: boolean;
  refreshProfile: () => Promise<void>;

  // Resume State
  generatedResumes: GeneratedResume[];
  addGeneratedResume: (resume: GeneratedResume) => void;
  deleteGeneratedResume: (id: string) => void;
  getResumeById: (id: string) => GeneratedResume | undefined;

  // UI State
  showFlag: (message: string, type: FlagType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true); // Start true
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>([]);

  const [flag, setFlag] = useState<FlagState>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Centralized Profile Fetching
  const refreshProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const res = await api.get<GetProfileResponse>("/profile/master");
      setProfile(res.data.data);
    } catch (error) {
      setProfile(null);
      console.error("Failed to fetch master profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  const {user , isLoading} = useAuth()

  useEffect(() => {
  if (!isLoading && user) {
    refreshProfile(); 
  }

  if (!isLoading && !user) {
    setProfile(null); 
    setIsLoadingProfile(false);
  }
}, [user, isLoading]);

  const showFlag = (message: string, type: FlagType) => {
    setFlag({ message, type, visible: true });
    setTimeout(() => {
      setFlag((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const addGeneratedResume = (resume: GeneratedResume) => {
    setGeneratedResumes((prev) => [resume, ...prev]);
  };

  const deleteGeneratedResume = (id: string) => {
    setGeneratedResumes((prev) => prev.filter((resume) => resume.id !== id));
  };

  const getResumeById = (id: string) => {
    return generatedResumes.find((resume) => resume.id === id);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        isLoadingProfile,
        refreshProfile,
        generatedResumes,
        addGeneratedResume,
        deleteGeneratedResume,
        getResumeById,
        showFlag,
      }}
    >
      {children}
      <Flag message={flag.message} type={flag.type} visible={flag.visible} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
