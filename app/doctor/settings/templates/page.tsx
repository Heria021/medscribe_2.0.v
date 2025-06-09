"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  ArrowLeft,
  Stethoscope,
  Save,
  Plus,
  Edit,
  Trash2,
  Copy
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface SOAPTemplate {
  id: string;
  name: string;
  specialty: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isDefault: boolean;
  createdAt: Date;
}

export default function DoctorTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SOAPTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [templates, setTemplates] = useState<SOAPTemplate[]>([
    {
      id: "1",
      name: "General Consultation",
      specialty: "General Medicine",
      subjective: "Chief complaint:\nHistory of present illness:\nReview of systems:",
      objective: "Vital signs:\nPhysical examination:\nLaboratory results:",
      assessment: "Primary diagnosis:\nDifferential diagnosis:\nSeverity assessment:",
      plan: "Treatment plan:\nMedications:\nFollow-up:\nPatient education:",
      isDefault: true,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Cardiology Follow-up",
      specialty: "Cardiology",
      subjective: "Cardiac symptoms:\nExercise tolerance:\nMedication compliance:",
      objective: "Cardiovascular examination:\nECG findings:\nEcho results:",
      assessment: "Cardiac status:\nRisk stratification:",
      plan: "Medication adjustments:\nLifestyle modifications:\nNext appointment:",
      isDefault: false,
      createdAt: new Date(),
    },
  ]);

  const [newTemplate, setNewTemplate] = useState<Partial<SOAPTemplate>>({
    name: "",
    specialty: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "doctor") {
      router.push("/auth/login");
    }
  }, [session, status, router]);

  const handleSaveTemplate = async () => {
    setIsLoading(true);
    try {
      if (isCreating) {
        const template: SOAPTemplate = {
          ...newTemplate as SOAPTemplate,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        setTemplates(prev => [...prev, template]);
        setNewTemplate({
          name: "",
          specialty: "",
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          isDefault: false,
        });
        setIsCreating(false);
        toast({
          title: "Template created",
          description: "Your SOAP note template has been created.",
        });
      } else if (editingTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
        setEditingTemplate(null);
        toast({
          title: "Template updated",
          description: "Your SOAP note template has been updated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error saving template",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template deleted",
      description: "The SOAP note template has been deleted.",
    });
  };

  const handleDuplicateTemplate = (template: SOAPTemplate) => {
    const duplicated: SOAPTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
    };
    setTemplates(prev => [...prev, duplicated]);
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created.",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "doctor") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/doctor/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold tracking-tight">SOAP Note Templates</h1>
              <p className="text-muted-foreground text-sm">
                Create and manage templates for medical documentation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                Doctor Account
              </Badge>
              <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full scrollbar-hide">
            <div className="space-y-6">
              {/* Create/Edit Template Form */}
              {(isCreating || editingTemplate) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {isCreating ? "Create New Template" : "Edit Template"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input
                          value={isCreating ? newTemplate.name : editingTemplate?.name}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, name: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Specialty</Label>
                        <Input
                          value={isCreating ? newTemplate.specialty : editingTemplate?.specialty}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, specialty: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, specialty: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter specialty"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subjective Template</Label>
                        <Textarea
                          value={isCreating ? newTemplate.subjective : editingTemplate?.subjective}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, subjective: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, subjective: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter subjective template"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Objective Template</Label>
                        <Textarea
                          value={isCreating ? newTemplate.objective : editingTemplate?.objective}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, objective: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, objective: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter objective template"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Assessment Template</Label>
                        <Textarea
                          value={isCreating ? newTemplate.assessment : editingTemplate?.assessment}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, assessment: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, assessment: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter assessment template"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Plan Template</Label>
                        <Textarea
                          value={isCreating ? newTemplate.plan : editingTemplate?.plan}
                          onChange={(e) => {
                            if (isCreating) {
                              setNewTemplate(prev => ({ ...prev, plan: e.target.value }));
                            } else if (editingTemplate) {
                              setEditingTemplate(prev => prev ? { ...prev, plan: e.target.value } : null);
                            }
                          }}
                          placeholder="Enter plan template"
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreating(false);
                          setEditingTemplate(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTemplate} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Template"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Templates List */}
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {template.name}
                            {template.isDefault && (
                              <Badge variant="default" className="text-xs">Default</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">{template.specialty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateTemplate(template)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {!template.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-1">Subjective:</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{template.subjective}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Objective:</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{template.objective}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Assessment:</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{template.assessment}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Plan:</h4>
                          <p className="text-muted-foreground whitespace-pre-line">{template.plan}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
