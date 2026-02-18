import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, Save, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createWingApi,
  getWingsListApi,
  updateWingApi,
  deleteWingApi,
} from "@/api/wing.api";
import { getProjectsListApi } from "@/api/project.api";
import { mapWingToApi, mapWingFromApi } from "@/utils/dataMapper";

const wingSchema = z.object({
  wingName: z.string().min(1, "Wing name is required"),
  projectId: z.string().min(1, "Project selection is required"),
  constructionArea: z.number().positive("Construction area must be greater than 0"),
});

interface WingData {
  id: string;
  wingName: string;
  projectId: string;
  projectName: string;
  companyName: string;
  constructionArea: number;
}

interface Project {
  id: string;
  projectName: string;
  companyName: string;
  totalArea: number;
}

const WingMaster = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [wings, setWings] = useState<WingData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof wingSchema>>({
    resolver: zodResolver(wingSchema),
    defaultValues: {
      wingName: "",
      projectId: "",
      constructionArea: 0,
    },
  });

  // Load projects and wings from Supabase
  useEffect(() => {
    loadProjects();
    loadWings();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await getProjectsListApi();
      const mappedProjects = (data || []).map((project: any) => ({
        id: project.id,
        projectName: project.project_name,
        companyName: project.company_name || "",
        totalArea: Number(project.total_area) || 0,
      }));
      setProjects(mappedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    }
  };

  const loadWings = async () => {
    try {
      const data = await getWingsListApi();
      const mappedWings = (data || []).map(mapWingFromApi);
      setWings(mappedWings);
    } catch (error) {
      console.error("Error loading wings:", error);
      toast({
        title: "Error",
        description: "Failed to load wings",
        variant: "destructive",
      });
    }
  };


  const calculateProjectAllocatedArea = (projectId: string) => {
    return wings
      .filter(wing => wing.projectId === projectId)
      .reduce((total, wing) => total + wing.constructionArea, 0);
  };

  const validateAreaAllocation = (projectId: string, newConstructionArea: number, excludeWingId?: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return { valid: false, message: "Project not found" };

    const currentAllocated = wings
      .filter(wing => wing.projectId === projectId && wing.id !== excludeWingId)
      .reduce((total, wing) => total + wing.constructionArea, 0);

    const totalAfterAddition = currentAllocated + newConstructionArea;

    if (totalAfterAddition > project.totalArea) {
      return {
        valid: false,
        message: `The Construction Area for this wing exceeds the Total Area of Construction. Total Project Area: ${project.totalArea} sq.m, Currently allocated: ${currentAllocated} sq.m, Remaining: ${project.totalArea - currentAllocated} sq.m`
      };
    }

    return { valid: true, message: "" };
  };

  const handleSave = async (values: z.infer<typeof wingSchema>) => {
    // Check for duplicate wing name in the same project
    const duplicateWing = wings.find(wing => 
      wing.projectId === values.projectId && 
      wing.wingName.toLowerCase() === values.wingName.toLowerCase() &&
      wing.id !== editingId
    );

    if (duplicateWing) {
      toast({
        title: "Validation Error",
        description: "Wing name already exists in this project",
        variant: "destructive"
      });
      return;
    }

    // Enhanced area validation
    const validation = validateAreaAllocation(values.projectId, values.constructionArea, editingId || undefined);
    if (!validation.valid) {
      toast({
        title: "Area Validation Error",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedProject = projects.find(p => p.id === values.projectId);
      const wingData: WingData = {
        id: editingId || "",
        wingName: values.wingName,
        projectId: values.projectId,
        projectName: selectedProject?.projectName || "",
        companyName: selectedProject?.companyName || "",
        constructionArea: values.constructionArea,
      };

      if (editingId) {
        const apiData = mapWingToApi(wingData);
        const response = await updateWingApi(apiData, editingId);
        const updatedWing = mapWingFromApi(response);
        setWings(prev => prev.map(wing => 
          wing.id === editingId ? updatedWing : wing
        ));
        toast({
          title: "Success",
          description: "Wing updated successfully"
        });
      } else {
        const apiData = mapWingToApi(wingData);
        const response = await createWingApi(apiData);
        const newWing = mapWingFromApi(response);
        setWings(prev => [...prev, newWing]);
        toast({
          title: "Success",
          description: "Wing added successfully"
        });
      }

      // Reset form
      setEditingId(null);
      form.reset({
        wingName: "",
        projectId: "",
        constructionArea: 0,
      });
    } catch (error) {
      console.error("Error saving wing:", error);
      toast({
        title: "Error",
        description: "Failed to save wing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (wing: WingData) => {
    setEditingId(wing.id);
    form.reset({
      wingName: wing.wingName,
      projectId: wing.projectId,
      constructionArea: wing.constructionArea,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWingApi(id);
      setWings(prev => prev.filter(wing => wing.id !== id));
      if (editingId === id) {
        setEditingId(null);
        form.reset();
      }
      toast({
        title: "Success",
        description: "Wing deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting wing:", error);
      toast({
        title: "Error",
        description: "Failed to delete wing. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      wingName: "",
      projectId: "",
      constructionArea: 0,
    });
  };

  const getProjectAreaSummary = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const allocatedArea = calculateProjectAllocatedArea(projectId);
    return {
      totalArea: project?.totalArea || 0,
      allocatedArea,
      remainingArea: (project?.totalArea || 0) - allocatedArea
    };
  };

  const selectedProjectId = form.watch("projectId");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Wing Master
          </CardTitle>
          <CardDescription>
            Manage wing details and construction areas linked to projects
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Wing Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edit Wing" : "Add New Wing"}
          </CardTitle>
          <CardDescription>
            Enter wing details and construction area allocation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.companyName} - {project.projectName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedProjectId && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900">Project Area Summary</h4>
                      {(() => {
                        const summary = getProjectAreaSummary(selectedProjectId);
                        const selectedProject = projects.find(p => p.id === selectedProjectId);
                        return (
                          <div className="text-sm text-blue-800 mt-1">
                            <p>Total Area: {summary.totalArea} sq.m</p>
                            <p>Allocated: {summary.allocatedArea} sq.m</p>
                            <p>Remaining: {summary.remainingArea} sq.m</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="wingName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wing Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., A, B, North Wing"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constructionArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Construction Area (Sq.m) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter construction area"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 border-b pb-2">Project Details</h3>
                  
                  {selectedProjectId && (() => {
                    const selectedProject = projects.find(p => p.id === selectedProjectId);
                    return selectedProject ? (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Selected Project Details</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Company: {selectedProject.companyName}</p>
                          <p>Project: {selectedProject.projectName}</p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                {editingId && (
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingId ? "Update Wing" : "Save Wing"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Wings List */}
      {wings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Wings</CardTitle>
            <CardDescription>
              List of all wings in the system grouped by projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.map((project) => {
                const projectWings = wings.filter(wing => wing.projectId === project.id);
                if (projectWings.length === 0) return null;
                
                const summary = getProjectAreaSummary(project.id);
                
                return (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {project.companyName} - {project.projectName}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Total Area: {summary.totalArea} sq.m | </span>
                          <span>Allocated: {summary.allocatedArea} sq.m | </span>
                          <span>Remaining: {summary.remainingArea} sq.m</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {projectWings.length} wing{projectWings.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {projectWings.map((wing) => (
                        <div key={wing.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{wing.wingName}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <p>Area: {wing.constructionArea} sq.m</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleEdit(wing)}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(wing.id)}
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WingMaster;
