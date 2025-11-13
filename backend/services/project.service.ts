import logger from "../config/logger";
import { Prisma } from "../generated/prisma";
import {
  createProjectRepository,
  getProjectByWhereCondition,
  getProjectListByWhereCondition,
  updateProjectRepository,
} from "../repositories/project.repository";
import { ApiError } from "../utils/response.handler";
import { constants } from "http2";
import { messages } from "../utils/messages";

const getProjectListService = async (): Promise<any> => {
  logger.info("getProjectListService: Request received to fetch project list");

  const projects = await getProjectListByWhereCondition(
    {},
    {
      id: true,
      project_name: true,
      actual_construction_cost: true,
      estimated_construction_cost: true,
      actual_land_cost: true,
      estimated_land_cost: true,
      company_id: true,
      construction_percentage: true,
      project_completion_percentage: true,
      report_date: true,
      revenue_recognized: true,
      total_actual_cost: true,
      total_estimated_cost: true,
      total_area: true,
      company: {
        select: {
          company_name: true,
        },
      },
    }
  );

  logger.info(`getProjectListService: Fetched ${projects.length} projects`);

  return projects.map((project) => ({
    id: project.id,
    projectName: project.project_name,
    actualConstructionCost: project.actual_construction_cost,
    estimatedConstructionCost: project.estimated_construction_cost,
    actualLandCost: project.actual_land_cost,
    estimatedLandCost: project.estimated_land_cost,
    constructionPercentage: project.construction_percentage,
    projectCompletionPercentage: project.project_completion_percentage,
    reportDate: project.report_date ? project.report_date.toISOString() : null,
    revenueRecognized: project.revenue_recognized,
    totalActualCost: project.total_actual_cost,
    totalEstimatedCost: project.total_estimated_cost,
    totalArea: project.total_area,
    companyId: project.company_id,
    companyName: project?.company?.company_name
  }));
};

const createProjectService = async (payload: any): Promise<string> => {
  logger.info("createProjectService: Request received to create a new project");

  const data: Prisma.projectCreateInput = {
    project_name: payload.projectName,
    actual_construction_cost: payload.actualConstructionCost,
    estimated_construction_cost: payload.estimatedConstructionCost,
    actual_land_cost: payload.actualLandCost,
    estimated_land_cost: payload.estimatedLandCost,
    construction_percentage: payload.constructionPercentage,
    project_completion_percentage: payload.projectCompletionPercentage,
    report_date: new Date(payload.reportDate),
    revenue_recognized: payload.revenueRecognized,
    total_actual_cost: payload.totalActualCost,
    total_estimated_cost: payload.totalEstimatedCost,
    total_area: payload.totalArea,
    company: {
      connect: {
        id: payload.companyId,
      },
    },
  };

  const projectId = await createProjectRepository(data);

  logger.info(`createProjectService: Project created with ID ${projectId}`);
  return projectId;
};

const updateProjectService = async (
  projectId: string,
  payload: any
): Promise<void> => {
  logger.info("updateProjectService: Request received to update a project");

  const project = await getProjectByWhereCondition({
    id: projectId,
  });

  if (!project) {
    throw new ApiError(
      constants.HTTP_STATUS_NOT_FOUND,
      messages.PROJECT_NOT_FOUND
    );
  }

  const data: Prisma.projectUpdateInput = {
    project_name: payload.projectName,
    actual_construction_cost: payload.actualConstructionCost,
    estimated_construction_cost: payload.estimatedConstructionCost,
    actual_land_cost: payload.actualLandCost,
    estimated_land_cost: payload.estimatedLandCost,
    construction_percentage: payload.constructionPercentage,
    project_completion_percentage: payload.projectCompletionPercentage,
    report_date: new Date(payload.reportDate),
    revenue_recognized: payload.revenueRecognized,
    total_actual_cost: payload.totalActualCost,
    total_estimated_cost: payload.totalEstimatedCost,
    total_area: payload.totalArea,
  };

  await updateProjectRepository(
    {
      id: projectId,
    },
    data
  );

  logger.info(`updateProjectService: Project updated with ID ${projectId}`);
};

const deleteProjectService = async (projectId: string): Promise<void> => {
  logger.info("deleteProjectService: Request received to delete a project");

  const project = await getProjectByWhereCondition({
    id: projectId,
  });

  if (!project) {
    throw new ApiError(
      constants.HTTP_STATUS_NOT_FOUND,
      messages.PROJECT_NOT_FOUND
    );
  }

  await updateProjectRepository(
    {
      id: projectId,
    },
    { is_active: false }
  );

  logger.info(`deleteProjectService: Project deleted with ID ${projectId}`);
};

export {
  getProjectListService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
};
