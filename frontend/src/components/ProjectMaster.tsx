import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Save, Upload, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ProjectMasterProps,
  ProjectData,
  Company,
} from "@/types/project.types";
import {
  createProjectApi,
  getProjectsListApi,
  updateProjectApi,
} from "@/api/project.api";
import { getCompaniesListApi } from "@/api/company.api";

const ProjectMaster = ({ reportingDate }: ProjectMasterProps) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectData>({
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
    projectCompletionPercentage: "0.00",
    constructionPercentage: "0.00",
    revenueRecognized: false,
  });

  // Call the getCompanies API to fetch company data
  useEffect(() => {
    getCompaniesList();
    getProjectsList();
  }, []);

  const getProjectsList = async () => {
    try {
      const response = await getProjectsListApi();
      setProjects(response.data);
      console.log("Projects fetched successfully");
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCompaniesList = async () => {
    try {
      const response = await getCompaniesListApi();
      setCompanies(response.data);
      console.log("Companies fetched successfully");
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch companies. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-calculate derived fields
  useEffect(() => {
    const totalEstimated =
      Number(currentProject.estimatedLandCost) +
      Number(currentProject.estimatedConstructionCost);
    const totalActual =
      Number(currentProject.actualLandCost) + Number(currentProject.actualConstructionCost);
    const projectCompletion =
      totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
    const constructionCompletion =
      currentProject.estimatedConstructionCost > 0
        ? (currentProject.actualConstructionCost /
            currentProject.estimatedConstructionCost) *
          100
        : "0.00";
    const revenueRecognized = Number(constructionCompletion) >= 25;

    setCurrentProject((prev) => ({
      ...prev,
      totalEstimatedCost: totalEstimated,
      totalActualCost: totalActual,
      projectCompletionPercentage: projectCompletion.toFixed(2),
      constructionPercentage:
        typeof constructionCompletion === "number"
          ? constructionCompletion.toFixed(2)
          : constructionCompletion,
      revenueRecognized: revenueRecognized,
    }));
  }, [
    currentProject.estimatedLandCost,
    currentProject.estimatedConstructionCost,
    currentProject.actualLandCost,
    currentProject.actualConstructionCost,
  ]);

  // Set report date from reporting date
  useEffect(() => {
    if (reportingDate) {
      setCurrentProject((prev) => ({
        ...prev,
        reportDate: reportingDate,
      }));
    }
  }, [reportingDate]);

  const handleInputChange = (
    field: keyof ProjectData,
    value: string | number
  ) => {
    if (field === "companyId") {
      const selectedCompany = companies.find((c) => c.id === value);
      setCurrentProject((prev) => ({
        ...prev,
        companyId: value as string,
        companyName: selectedCompany?.companyName || "",
      }));
      return;
    }

    const numericFields: (keyof ProjectData)[] = [
      "totalArea",
      "estimatedLandCost",
      "estimatedConstructionCost",
      "actualLandCost",
      "actualConstructionCost",
    ];

    if (numericFields.includes(field)) {
      const raw = (value as string).replace(/,/g, "");
      if (!/^\d*\.?\d*$/.test(raw)) return;

      const parsed = parseFloat(raw);
      if (isNaN(parsed)) return;

      setCurrentProject((prev) => ({
        ...prev,
        [field]: parsed,
        // store number; formatting is done in display only
      }));
    } else {
      setCurrentProject((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!reportingDate) {
      toast({
        title: "Validation Error",
        description: "Please set the reporting date first",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject.companyId) {
      toast({
        title: "Validation Error",
        description: "Please select a company",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject.projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    // Enhanced validation for total area
    if (currentProject.totalArea <= 0) {
      toast({
        title: "Validation Error",
        description:
          "Total Area of Construction cannot be zero or negative. Please enter a valid value.",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(currentProject.totalArea)) {
      toast({
        title: "Validation Error",
        description:
          "Total Area of Construction must be a valid numeric value.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Update existing project
      try {
        if (!currentProject.id) {
          throw new Error("Project ID is required for update");
        }
        const response = await updateProjectApi(currentProject, editingId);
        console.log("Project updated successfully:", response);
        // update the project in the state
        setProjects((prev) =>
          prev.map((p) =>
            p.id === editingId ? { ...p, ...currentProject } : p
          )
        );
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } catch (error) {
        console.error("Error updating project:", error);
        toast({
          title: "Error",
          description: "Failed to update project. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const response = await createProjectApi(currentProject);
        console.log("Project created successfully:", response);
        const newProject: ProjectData = {
          ...currentProject,
          id: response.id, // Assuming the API returns the new project ID
        };
        setProjects((prev) => [...prev, newProject]);
        toast({
          title: "Success",
          description: "Project added successfully",
        });
      } catch (error) {
        console.error("Error adding project:", error);
        toast({
          title: "Error",
          description: "Failed to add project. Please try again.",
          variant: "destructive",
        });
      }
    }

    // Reset form
    setEditingId(null);
    setCurrentProject({
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
      projectCompletionPercentage: "0.00",
      constructionPercentage: "0.00",
      revenueRecognized: false,
    });
  };

  const handleEdit = (projectToEdit: ProjectData) => {
    console.log("Editing project:", projectToEdit);
    setCurrentProject(projectToEdit);
    setEditingId(projectToEdit.id);
  };

  const handleDelete = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({
      title: "Success",
      description: "Project deleted successfully",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentProject({
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
      projectCompletionPercentage: "0.00",
      constructionPercentage: "0.00",
      revenueRecognized: false,
    });
  };

  const exportToExcel = () => {
    toast({
      title: "Export",
      description:
        "Excel export functionality will be implemented in the next phase",
    });
  };

  const importFromExcel = () => {
    toast({
      title: "Import",
      description:
        "Excel import functionality will be implemented in the next phase",
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
            Manage project costs, area, and completion tracking linked to
            companies
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={importFromExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import Excel
        </Button>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="flex items-center gap-2"
        >
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
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>

              <div>
                <Label htmlFor="company-select">Company *</Label>
                <Select
                  value={currentProject.companyId}
                  onValueChange={(value) =>
                    handleInputChange("companyId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  value={currentProject.projectName}
                  onChange={(e) =>
                    handleInputChange("projectName", e.target.value)
                  }
                  placeholder="e.g., Ojash"
                />
              </div>

              <div>
                <Label htmlFor="total-area">
                  Total Area of Construction (Sq. Mtr) *
                </Label>
                <Input
                  id="total-area"
                  type="text"
                  step="0.01"
                  value={currentProject.totalArea.toString()}
                  onChange={(e) =>
                    handleInputChange("totalArea", e.target.value)
                  }
                  placeholder="e.g., 11711.20"
                />
              </div>

              <div>
                <Label htmlFor="report-date">Date of Report</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={currentProject.reportDate}
                  onChange={(e) =>
                    handleInputChange("reportDate", e.target.value)
                  }
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
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Estimated Costs
              </h3>

              <div>
                <Label htmlFor="est-land-cost">Estimated Land Cost (₹)</Label>
                <Input
                  id="est-land-cost"
                  type="text"
                  value={currentProject.estimatedLandCost || ""}
                  onChange={(e) =>
                    handleInputChange("estimatedLandCost", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="est-construction-cost">
                  Estimated Construction Cost (₹)
                </Label>
                <Input
                  id="est-construction-cost"
                  type="text"
                  step="0.01"
                  value={currentProject.estimatedConstructionCost || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "estimatedConstructionCost",
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="total-est-cost">
                  Total Estimated Project Cost (₹)
                </Label>
                <Input
                  id="total-est-cost"
                  type="text"
                  step="0.01"
                  value={currentProject.totalEstimatedCost}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: Land Cost + Construction Cost
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Actual Costs
              </h3>

              <div>
                <Label htmlFor="actual-land-cost">Actual Land Cost (₹)</Label>
                <Input
                  id="actual-land-cost"
                  type="text"
                  step="0.01"
                  value={currentProject.actualLandCost || ""}
                  onChange={(e) =>
                    handleInputChange("actualLandCost", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="actual-construction-cost">
                  Actual Construction Cost (₹)
                </Label>
                <Input
                  id="actual-construction-cost"
                  type="text"
                  step="0.01"
                  value={currentProject.actualConstructionCost || ""}
                  onChange={(e) =>
                    handleInputChange("actualConstructionCost", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="total-actual-cost">
                  Total Actual Project Cost (₹)
                </Label>
                <Input
                  id="total-actual-cost"
                  type="text"
                  step="0.01"
                  value={currentProject.totalActualCost}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: Actual Land + Actual Construction
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 border-b pb-2">
                Completion Metrics
              </h3>

              <div>
                <Label htmlFor="project-completion">
                  Project Completion (%)
                </Label>
                <Input
                  id="project-completion"
                  type="number"
                  step="0.01"
                  value={currentProject.projectCompletionPercentage.toString()}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: (Total Actual / Total Estimated) × 100
                </p>
              </div>

              <div>
                <Label htmlFor="construction-completion">
                  Construction Completion (%)
                </Label>
                <Input
                  id="construction-completion"
                  type="number"
                  step="0.01"
                  value={currentProject.constructionPercentage.toString()}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-calculated: (Actual Construction / Estimated
                  Construction) × 100
                </p>
              </div>

              <div>
                <Label>Revenue Recognition Status</Label>
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    currentProject.revenueRecognized
                      ? "bg-green-50 text-green-800"
                      : "bg-orange-50 text-orange-800"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  {currentProject.revenueRecognized
                    ? "Revenue Recognized (≥25% construction)"
                    : "Work in Progress (<25% construction)"}
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
                <div
                  key={proj.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {proj.companyName} - {proj.projectName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Area: {proj.totalArea.toLocaleString()} Sq.Mtr
                      </p>
                      <p className="text-sm text-gray-600">
                        Report Date:{" "}
                        {new Date(proj.reportDate).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Est. Cost:</span> ₹
                        {proj.totalEstimatedCost.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Actual Cost:</span> ₹
                        {proj.totalActualCost.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium">Completion:</span>
                        {Number(proj.projectCompletionPercentage).toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                          proj.revenueRecognized
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {proj.revenueRecognized
                          ? "Revenue Eligible"
                          : "Work in Progress"}
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
