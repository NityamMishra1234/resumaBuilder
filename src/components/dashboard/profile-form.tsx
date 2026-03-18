'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

// Import your Zod schema for validation
import { resumeProfileSchema } from '@/lib/newSchema';
// Import your strict API types
import { Profile } from '@/types/profile.type'; 

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/api/api'; // Assuming you have your axios instance here

// 1. UPDATE PROPS: Strictly tie this to your API Profile type
type ProfileFormProps = {
  existingProfile: Profile | null;
  onSave: (data: Profile | null) => void;
};

export function ProfileForm({ existingProfile, onSave }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // 2. We use 'any' for defaultValues here safely because RHF 
  // allows extra fields (like your database IDs) to sit quietly in the background
  const form = useForm<z.infer<typeof resumeProfileSchema>>({
    resolver: zodResolver(resumeProfileSchema),
    defaultValues: (existingProfile as any) || {
      fullName: '', email: '', phone: '', location: '',
      linkedin: '', github: '', portfolio: '', twitter: '', summary: '',
      experiences: [], education: [], projects: [], certifications: [], skills: [],
    },
  });

  useEffect(() => {
    if (existingProfile) {
      form.reset(existingProfile as any);
    }
  }, [existingProfile, form]);

  // Dynamic Field Arrays
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({ control: form.control, name: 'experiences' });
  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({ control: form.control, name: 'projects' });
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control: form.control, name: 'certifications' });
  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({ control: form.control, name: 'skills' });

  const onSubmit = async (data: z.infer<typeof resumeProfileSchema>) => {
  setIsSaving(true);

  try {
    let res;

    if (existingProfile?.id) {
      // ✅ UPDATE
      res = await api.patch(`/profile/${existingProfile.id}`, data);
    } else {
      // ✅ CREATE
      res = await api.post("/profile", data);
    }

    const updatedProfile = res.data.data as Profile;

    // update global state
    onSave(updatedProfile);

    toast({
      title: 'Profile Saved',
      description: 'Your master profile has been successfully updated.',
    });

  } catch (error: any) {
    console.error(error);

    // 🔥 smart handling
    if (error.response?.status === 409) {
      toast({
        title: 'Profile already exists',
        description: 'Refreshing and updating instead...',
      });

      try {
        // fallback: fetch + update
        const profileRes = await api.get("/profile/master");
        const profile = profileRes.data.data;

        const updateRes = await api.patch(`/profile/${profile.id}`, data);

        onSave(updateRes.data.data);
      } catch (err) {
        console.error(err);
      }

    } else {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    }

  } finally {
    setIsSaving(false);
  }
};

  const formTabs = [
    { value: 'personal', label: 'Personal' },
    { value: 'summary', label: 'Summary' },
    { value: 'experience', label: 'Experience' },
    { value: 'education', label: 'Education' },
    { value: 'skills', label: 'Skills' },
    { value: 'projects', label: 'Projects' },
    { value: 'certs', label: 'Certifications' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="personal" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              {formTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              
              {/* PERSONAL INFO */}
              <TabsContent value="personal">
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="India" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 border-t pt-4 mt-2">
                    <FormField control={form.control} name="linkedin" render={({ field }) => (
                      <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="github" render={({ field }) => (
                      <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="portfolio" render={({ field }) => (
                      <FormItem><FormLabel>Portfolio URL</FormLabel><FormControl><Input placeholder="https://yourportfolio.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="twitter" render={({ field }) => (
                      <FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input placeholder="https://twitter.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </div>
              </TabsContent>

              {/* SUMMARY */}
              <TabsContent value="summary">
                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Summary</FormLabel>
                    <FormControl><Textarea placeholder="A brief summary of your career..." className="min-h-32" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </TabsContent>

              {/* EXPERIENCES */}
              <TabsContent value="experience">
                <div className="space-y-6">
                  {experienceFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExperience(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`experiences.${index}.company`} render={({ field }) => (
                          <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Google" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.role`} render={({ field }) => (
                          <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="Backend Developer" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.startDate`} render={({ field }) => (
                          <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="2022" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.endDate`} render={({ field }) => (
                          <FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="2024" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`experiences.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Worked on scalable microservices..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendExperience({ company: '', role: '', description: '', startDate: '', endDate: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                  </Button>
                </div>
              </TabsContent>

              {/* EDUCATION */}
              <TabsContent value="education">
                <div className="space-y-6">
                  {educationFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (
                        <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="IIT Delhi" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                          <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="BTech" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`education.${index}.field`} render={({ field }) => (
                          <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`education.${index}.startDate`} render={({ field }) => (
                          <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input placeholder="2017" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`education.${index}.endDate`} render={({ field }) => (
                          <FormItem><FormLabel>End Date</FormLabel><FormControl><Input placeholder="2021" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendEducation({ institution: '', degree: '', field: '', startDate: '', endDate: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                  </Button>
                </div>
              </TabsContent>

              {/* SKILLS */}
              <TabsContent value="skills">
                <div className="space-y-4">
                  {skillFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4">
                      <FormField control={form.control} name={`skills.${index}.name`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Skill Name</FormLabel><FormControl><Input placeholder="Node.js" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`skills.${index}.category`} render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel>Category</FormLabel><FormControl><Input placeholder="Backend" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)} className="mb-0.5">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendSkill({ name: '', category: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
                  </Button>
                </div>
              </TabsContent>

              {/* PROJECTS */}
              <TabsContent value="projects">
                <div className="space-y-6">
                  {projectFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProject(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormField control={form.control} name={`projects.${index}.title`} render={({ field }) => (
                        <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="Resume Builder" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`projects.${index}.githubUrl`} render={({ field }) => (
                          <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`projects.${index}.projectUrl`} render={({ field }) => (
                          <FormItem><FormLabel>Live Project URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="AI powered resume generator..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendProject({ title: '', description: '', githubUrl: '', projectUrl: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                </div>
              </TabsContent>

              {/* CERTIFICATIONS */}
              <TabsContent value="certs">
                <div className="space-y-6">
                  {certFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border p-4 space-y-4 relative">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeCert(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`certifications.${index}.title`} render={({ field }) => (
                          <FormItem><FormLabel>Certification Title</FormLabel><FormControl><Input placeholder="AWS Certified Developer" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`certifications.${index}.certificateUrl`} render={({ field }) => (
                          <FormItem><FormLabel>Certificate URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`certifications.${index}.description`} render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Cloud developer certification..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => appendCert({ title: '', description: '', certificateUrl: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Certification
                  </Button>
                </div>
              </TabsContent>

            </CardContent>
          </Card>
        </Tabs>
      </form>
    </Form>
  );
}