'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GeneratedResume, ResumeProfile } from '@/lib/types';

interface AppContextType {
  profile: ResumeProfile | null;
  setProfile: (profile: ResumeProfile | null) => void;
  generatedResumes: GeneratedResume[];
  addGeneratedResume: (resume: GeneratedResume) => void;
  deleteGeneratedResume: (id: string) => void;
  getResumeById: (id: string) => GeneratedResume | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>(
    []
  );

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
        generatedResumes,
        addGeneratedResume,
        deleteGeneratedResume,
        getResumeById,
      }}
    >
      {children}
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
