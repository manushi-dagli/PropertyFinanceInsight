export interface ProjectData {
  id: string;
  companyId: string;
  companyName: string;
  projectName: string;
  totalArea: number;
  estimatedLandCost: number;
  estimatedConstructionCost: number;
  totalEstimatedCost: number;
  reportDate: string;
  actualLandCost: number;
  actualConstructionCost: number;
  totalActualCost: number;
  projectCompletionPercentage: number;
  constructionPercentage: number;
  revenueRecognized: boolean;
}

export interface Company {
  id: string;
  name: string;
}

export interface ProjectMasterProps {
  reportingDate: string;
}