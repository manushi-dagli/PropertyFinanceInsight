import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  totalPlotArea: number;
}

const WingMaster = ({ reportingDate }: { reportingDate: string }) => {
  const { toast } = useToast();
  const [wings, setWings] = useState<WingData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentWing, setCurrentWing] = useState<WingData>({
    id: "",
    wingName: "",
    projectId: "",
    projectName: "",
    companyName: "",
    constructionArea: 0
  });

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Load wings from localStorage
  useEffect(() => {
    const savedWings = localStorage.getItem('wings');
    if (savedWings) {
      setWings(JSON.parse(savedWings));
    }
  }, []);

  // Save wings to localStorage
  useEffect(() => {
    localStorage.setItem('wings', JSON.stringify(wings));
  }, [wings]);

  const handleInputChange = (field: keyof WingData, value: string | number) => {
    setCurrentWing(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProjectChange = (projectId: string) => {
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setCurrentWing(prev => ({
        ...prev,
        projectId,
        projectName: selectedProject.projectName,
        companyName: selectedProject.companyName
      }));
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

    if (totalAfterAddition > project.totalPlotArea) {
      return {
        valid: false,
        message: `The Construction Area for this wing exceeds the Total Area of Construction. Total Project Area: ${project.totalPlotArea} sq.m, Currently allocated: ${currentAllocated} sq.m, Remaining: ${project.totalPlotArea - currentAllocated} sq.m`
      };
    }

    return { valid: true, message: "" };
  };

  const handleSave = () => {
    if (!currentWing.wingName.trim() || !currentWing.projectId) {
      toast({
        title: "Validation Error",
        description: "Wing name and project selection are required",
        variant: "destructive"
      });
      return;
    }

    if (currentWing.constructionArea <= 0) {
      toast({
        title: "Validation Error",
        description: "Construction area must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(currentWing.constructionArea)) {
      toast({
        title: "Validation Error",
        description: "Construction area must be a valid numeric value",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate wing name in the same project
    const duplicateWing = wings.find(wing => 
      wing.projectId === currentWing.projectId && 
      wing.wingName.toLowerCase() === currentWing.wingName.toLowerCase() &&
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
    const validation = validateAreaAllocation(currentWing.projectId, currentWing.constructionArea, editingId || undefined);
    if (!validation.valid) {
      toast({
        title: "Area Validation Error",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      // Update existing wing
      setWings(prev => prev.map(wing => 
        wing.id === editingId ? { ...currentWing, id: editingId } : wing
      ));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Wing updated successfully"
      });
    } else {
      // Add new wing
      const newWing = { ...currentWing, id: Date.now().toString() };
      setWings(prev => [...prev, newWing]);
      toast({
        title: "Success",
        description: "Wing added successfully"
      });
    }

    // Reset form
    setCurrentWing({
      id: "",
      wingName: "",
      projectId: "",
      projectName: "",
      companyName: "",
      constructionArea: 0
    });
  };

  const handleEdit = (wing: WingData) => {
    setCurrentWing(wing);
    setEditingId(wing.id);
  };

  const handleDelete = (id: string) => {
    setWings(prev => prev.filter(wing => wing.id !== id));
    toast({
      title: "Success",
      description: "Wing deleted successfully"
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentWing({
      id: "",
      wingName: "",
      projectId: "",
      projectName: "",
      companyName: "",
      constructionArea: 0
    });
  };

  const getProjectAreaSummary = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const allocatedArea = calculateProjectAllocatedArea(projectId);
    return {
      totalArea: project?.totalPlotArea || 0,
      allocatedArea,
      remainingArea: (project?.totalPlotArea || 0) - allocatedArea
    };
  };

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
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <Label htmlFor="project-select">Project *</Label>
                <Select value={currentWing.projectId} onValueChange={handleProjectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.companyName} - {project.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentWing.projectId && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Project Area Summary</h4>
                  {(() => {
                    const summary = getProjectAreaSummary(currentWing.projectId);
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

              <div>
                <Label htmlFor="wing-name">Wing Name *</Label>
                <Input
                  id="wing-name"
                  value={currentWing.wingName}
                  onChange={(e) => handleInputChange("wingName", e.target.value)}
                  placeholder="e.g., A, B, North Wing"
                />
              </div>

              <div>
                <Label htmlFor="construction-area">Construction Area (Sq.m) *</Label>
                <Input
                  id="construction-area"
                  type="number"
                  step="0.01"
                  value={currentWing.constructionArea}
                  onChange={(e) => handleInputChange("constructionArea", parseFloat(e.target.value) || 0)}
                  placeholder="Enter construction area"
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Project Details</h3>
              
              {currentWing.projectId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Selected Project Details</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Company: {currentWing.companyName}</p>
                    <p>Project: {currentWing.projectName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {editingId && (
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingId ? "Update Wing" : "Save Wing"}
            </Button>
          </div>
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
