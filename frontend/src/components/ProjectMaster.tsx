import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Save, Upload, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectMasterProps, ProjectData, Company } from "@/types/project.types";

const ProjectMaster = ({ reportingDate }: ProjectMasterProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData>({
    id: "",
    companyId: "",
    companyName: "",
    projectName: "",
    totalArea: 0,
    estimatedLandCost: 0,
    estimatedConstructionCost: 0,
    totalEstimatedCost: 0,
    reportDate: "",
    actualLandCost: 0,
    actualConstructionCost: 0,
    totalActualCost: 0,
    projectCompletionPercentage: 0,
    constructionPercentage: 0,
    revenueRecognized: false
  });

  // Load companies from localStorage
  useEffect(() => {
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  // Auto-calculate derived fields
  useEffect(() => {
    const totalEstimated = project.estimatedLandCost + project.estimatedConstructionCost;
    const totalActual = project.actualLandCost + project.actualConstructionCost;
    const projectCompletion = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
    const constructionCompletion = project.estimatedConstructionCost > 0 ? 
      (project.actualConstructionCost / project.estimatedConstructionCost) * 100 : 0;
    const revenueRecognized = constructionCompletion >= 25;

    setProject(prev => ({
      ...prev,
      totalEstimatedCost: totalEstimated,
      totalActualCost: totalActual,
      projectCompletionPercentage: projectCompletion,
      constructionPercentage: constructionCompletion,
      revenueRecognized: revenueRecognized
    }));
  }, [
    project.estimatedLandCost,
    project.estimatedConstructionCost,
    project.actualLandCost,
    project.actualConstructionCost
  ]);

  // Set report date from reporting date
  useEffect(() => {
    if (reportingDate) {
      setProject(prev => ({
        ...prev,
        reportDate: reportingDate
      }));
    }
  }, [reportingDate]);

  const handleInputChange = (field: keyof ProjectData, value: string | number) => {
    if (field === 'companyId') {
      const selectedCompany = companies.find(c => c.id === value);
      setProject(prev => ({
        ...prev,
        companyId: value as string,
        companyName: selectedCompany?.name || ""
      }));
    } else {
      const numericFields = [
        'totalArea', 'estimatedLandCost', 'estimatedConstructionCost', 
        'actualLandCost', 'actualConstructionCost'
      ];
      
      setProject(prev => ({
        ...prev,
        [field]: numericFields.includes(field) ? (parseFloat(value as string) || 0) : value
      }));
    }
  };

  const handleSave = () => {
    if (!reportingDate) {
      toast({
        title: "Validation Error",
        description: "Please set the reporting date first",
        variant: "destructive"
      });
      return;
    }

    if (!project.companyId) {
      toast({
        title: "Validation Error",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }

    if (!project.projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    // Enhanced validation for total area
    if (project.totalArea <= 0) {
      toast({
        title: "Validation Error",
        description: "Total Area of Construction cannot be zero or negative. Please enter a valid value.",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(project.totalArea)) {
      toast({
        title: "Validation Error",
        description: "Total Area of Construction must be a valid numeric value.",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.id === editingId ? { ...project, id: editingId } : p
      ));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Project updated successfully"
      });
    } else {
      // Add new project
      const newProject = { ...project, id: Date.now().toString() };
      setProjects(prev => [...prev, newProject]);
      toast({
        title: "Success",
        description: "Project added successfully"
      });
    }

    // Reset form
    setProject({
      id: "",
      companyId: "",
      companyName: "",
      projectName: "",
      totalArea: 0,
      estimatedLandCost: 0,
      estimatedConstructionCost: 0,
      totalEstimatedCost: 0,
      reportDate: reportingDate,
      actualLandCost: 0,
      actualConstructionCost: 0,
      totalActualCost: 0,
      projectCompletionPercentage: 0,
      constructionPercentage: 0,
      revenueRecognized: false
    });
  };

  const handleEdit = (projectToEdit: ProjectData) => {
    setProject(projectToEdit);
    setEditingId(projectToEdit.id);
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Project deleted successfully"
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setProject({
      id: "",
      companyId: "",
      companyName: "",
      projectName: "",
      totalArea: 0,
      estimatedLandCost: 0,
      estimatedConstructionCost: 0,
      totalEstimatedCost: 0,
      reportDate: reportingDate,
      actualLandCost: 0,
      actualConstructionCost: 0,
      totalActualCost: 0,
      projectCompletionPercentage: 0,
      constructionPercentage: 0,
      revenueRecognized: false
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export",
      description: "Excel export functionality will be implemented in the next phase"
    });
  };

  const importFromExcel = () => {
    toast({
      title: "Import",
      description: "Excel import functionality will be implemented in the next phase"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Master
          </CardTitle>
          <CardDescription>
            Manage project costs, area, and completion tracking linked to companies
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={importFromExcel} variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
        <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Project Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edit Project" : "Add New Project"}
          </CardTitle>
          <CardDescription>
            Enter project details linked to company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Project Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <Label htmlFor="company-select">Company *</Label>
                <Select value={project.companyId} onValueChange={(value) => handleInputChange("companyId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={project.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  placeholder="e.g., Ojash"
                />
              </div>

              <div>
                <Label htmlFor="total-area">Total Area of Construction (Sq. Mtr) *</Label>
                <Input
                  id="total-area"
                  type="number"
                  step="0.01"
                  value={project.totalArea || ""}
                  onChange={(e) => handleInputChange("totalArea", e.target.value)}
                  placeholder="e.g., 11711.20"
                />
              </div>

              <div>
                <Label htmlFor="report-date">Date of Report</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={project.reportDate}
                  onChange={(e) => handleInputChange("reportDate", e.target.value)}
                  disabled={!!reportingDate}
                  className={reportingDate ? "bg-gray-50" : ""}
                />
                {reportingDate && (
                  <p className="text-xs text-gray-600 mt-1">
                    Automatically set from global reporting date
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Costs */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Estimated Costs</h3>
              
              <div>
                <Label htmlFor="est-land-cost">Estimated Land Cost (₹)</Label>
                <Input
                  id="est-land-cost"
                  type="number"
                  step="0.01"
                  value={project.estimatedLandCost || ""}
                  onChange={(e) => handleInputChange("estimatedLandCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="est-construction-cost">Estimated Construction Cost (₹)</Label>
                <Input
                  id="est-construction-cost"
                  type="number"
                  step="0.01"
                  value={project.estimatedConstructionCost || ""}
                  onChange={(e) => handleInputChange("estimatedConstructionCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="total-est-cost">Total Estimated Project Cost (₹)</Label>
                <Input
                  id="total-est-cost"
                  type="number"
                  step="0.01"
                  value={project.totalEstimatedCost.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: Land Cost + Construction Cost
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Actual Costs</h3>
              
              <div>
                <Label htmlFor="actual-land-cost">Actual Land Cost (₹)</Label>
                <Input
                  id="actual-land-cost"
                  type="number"
                  step="0.01"
                  value={project.actualLandCost || ""}
                  onChange={(e) => handleInputChange("actualLandCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="actual-construction-cost">Actual Construction Cost (₹)</Label>
                <Input
                  id="actual-construction-cost"
                  type="number"
                  step="0.01"
                  value={project.actualConstructionCost || ""}
                  onChange={(e) => handleInputChange("actualConstructionCost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="total-actual-cost">Total Actual Project Cost (₹)</Label>
                <Input
                  id="total-actual-cost"
                  type="number"
                  step="0.01"
                  value={project.totalActualCost.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: Actual Land + Actual Construction
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">Completion Metrics</h3>
              
              <div>
                <Label htmlFor="project-completion">Project Completion (%)</Label>
                <Input
                  id="project-completion"
                  type="number"
                  step="0.01"
                  value={project.projectCompletionPercentage.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: (Total Actual / Total Estimated) × 100
                </p>
              </div>

              <div>
                <Label htmlFor="construction-completion">Construction Completion (%)</Label>
                <Input
                  id="construction-completion"
                  type="number"
                  step="0.01"
                  value={project.constructionPercentage.toFixed(2)}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: (Actual Construction / Estimated Construction) × 100
                </p>
              </div>

              <div>
                <Label>Revenue Recognition Status</Label>
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  project.revenueRecognized 
                    ? "bg-green-50 text-green-800" 
                    : "bg-orange-50 text-orange-800"
                }`}>
                  <TrendingUp className="h-4 w-4" />
                  {project.revenueRecognized 
                    ? "Revenue Recognized (≥25% construction)" 
                    : "Work in Progress (<25% construction)"
                  }
                </div>
              </div>
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
              {editingId ? "Update Project" : "Save Project"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              List of all projects with their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{proj.companyName} - {proj.projectName}</h3>
                      <p className="text-sm text-gray-600">Area: {proj.totalArea.toLocaleString()} Sq.Mtr</p>
                      <p className="text-sm text-gray-600">Report Date: {new Date(proj.reportDate).toLocaleDateString("en-GB")}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Est. Cost:</span> ₹{proj.totalEstimatedCost.toLocaleString()}</p>
                      <p><span className="font-medium">Actual Cost:</span> ₹{proj.totalActualCost.toLocaleString()}</p>
                      <p><span className="font-medium">Completion:</span> {proj.projectCompletionPercentage.toFixed(2)}%</p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                        proj.revenueRecognized 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {proj.revenueRecognized ? 'Revenue Eligible' : 'Work in Progress'}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(proj)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(proj.id)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectMaster;
