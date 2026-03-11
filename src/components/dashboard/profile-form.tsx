'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

import { ResumeProfile } from '@/lib/types';
import { resumeProfileSchema } from '@/lib/schema';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { useState } from 'react';

type ProfileFormProps = {
  existingProfile: ResumeProfile | null;
  onSave: (data: ResumeProfile) => void;
};

export function ProfileForm({ existingProfile, onSave }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof resumeProfileSchema>>({
    resolver: zodResolver(resumeProfileSchema),
    defaultValues: existingProfile || {
      personalInformation: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
      },
      links: { linkedIn: '', github: '', portfolio: '', website: '' },
      professionalSummary: '',
      experience: [],
      education: [],
      skills: {
        technicalSkills: '',
        tools: '',
        frameworks: '',
        softSkills: '',
      },
      projects: [],
      certifications: '',
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control: form.control,
    name: 'projects',
  });

  const onSubmit = (data: z.infer<typeof resumeProfileSchema>) => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onSave(data);
      setIsSaving(false);
      toast({
        title: 'Profile Saved',
        description: 'Your master profile has been successfully updated.',
      });
    }, 1000);
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
              <TabsContent value="personal">
                <div className="grid gap-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInformation.fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInformation.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="john.doe@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInformation.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInformation.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="links.linkedIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="links.github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="links.portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://yourportfolio.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="summary">
                <FormField
                  control={form.control}
                  name="professionalSummary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="A brief summary of your career..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="experience">
                <div className="space-y-6">
                  {experienceFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border p-4 space-y-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`experience.${index}.companyName`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Inc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role / Title</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Software Engineer"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`experience.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Jan 2020 - Present"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                          control={form.control}
                          name={`experience.${index}.keyAchievements`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key Achievements (one per line)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Developed a new feature that..." {...field} onChange={(e) => field.onChange(e.target.value.split('\n').map(value => ({ value })))} value={field.value.map(v => v.value).join('\n')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`experience.${index}.responsibilities`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Responsibilities (one per line)</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Maintained production services..." {...field} onChange={(e) => field.onChange(e.target.value.split('\n').map(value => ({ value })))} value={field.value.map(v => v.value).join('\n')} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendExperience({
                        companyName: '',
                        role: '',
                        duration: '',
                        keyAchievements: [],
                        responsibilities: [],
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="education">
                <div className="space-y-6">
                  {educationFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border p-4 space-y-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeEducation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`education.${index}.university`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>University / School</FormLabel>
                            <FormControl>
                              <Input placeholder="State University" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`education.${index}.degree`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Degree</FormLabel>
                              <FormControl>
                                <Input placeholder="B.S." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`education.${index}.field`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field of Study</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Computer Science"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`education.${index}.graduationYear`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduation Year</FormLabel>
                            <FormControl>
                              <Input placeholder="2022" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendEducation({
                        university: '',
                        degree: '',
                        field: '',
                        graduationYear: '',
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Education
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="skills.technicalSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technical Skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="JavaScript, Python, SQL..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills.tools"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tools</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Git, Docker, Figma..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills.frameworks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frameworks</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="React, Next.js, Node.js..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skills.softSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soft Skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Communication, Teamwork..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <div className="space-y-6">
                  {projectFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-lg border p-4 space-y-4 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => removeProject(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`projects.${index}.projectName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Awesome App" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`projects.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A short description of your project."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`projects.${index}.technologies`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technologies Used</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="React, TypeScript, TailwindCSS"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`projects.${index}.links`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Link</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://github.com/user/repo"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendProject({
                        projectName: '',
                        description: '',
                        technologies: '',
                        links: '',
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Project
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="certs">
                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="AWS Certified Developer, etc. (comma-separated)"
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </form>
    </Form>
  );
}
