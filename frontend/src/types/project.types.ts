export interface ProjectData {
  id?: string;
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
  projectCompletionPercentage: string;
  constructionPercentage: string;
  revenueRecognized: boolean;
}

export interface Company {
  id: string;
  companyName: string;
}

export interface ProjectMasterProps {
  reportingDate: string;
}