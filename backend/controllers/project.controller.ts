import { Request, Response } from "express";
import logger from "../config/logger";
import { messages } from "../utils/messages";
import { ControllerResponse, ApiResponse } from "../utils/response.handler";
import { constants } from "http2";
import { createProjectService, deleteProjectService, getProjectListService, updateProjectService } from "../services/project.service";

const getProjectListController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info("getProjectListController: Request received to get project list");

  const response = await getProjectListService();

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.PROJECT_LIST_FETCHED_SUCCESSFULLY,
    response
  ).send(res);
};

const createProjectController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info(
    "createProjectController: Request received to create a new project"
  );

  const response = await createProjectService(req.body);

  return new ApiResponse(
    constants.HTTP_STATUS_CREATED,
    messages.PROJECT_CREATED_SUCCESSFULLY,
    response
  ).send(res);
};

const updateProjectController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info("updateProjectController: Request received to update a project");

  const projectId = req.params.projectId;
  if (!projectId) {
    return new ApiResponse(
      constants.HTTP_STATUS_BAD_REQUEST,
      messages.PROJECT_ID_REQUIRED
    ).send(res);
  }

  const response = await updateProjectService(projectId, req.body);

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.PROJECT_UPDATED_SUCCESSFULLY,
    response
  ).send(res);
};

const deleteProjectController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info("deleteProjectController: Request received to delete a project");

  const projectId = req.params.projectId;
  if (!projectId) {
    return new ApiResponse(
      constants.HTTP_STATUS_BAD_REQUEST,
      messages.PROJECT_ID_REQUIRED
    ).send(res);
  }

  await deleteProjectService(projectId);

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.PROJECT_DELETED_SUCCESSFULLY
  ).send(res);
};

export {
  getProjectListController,
  createProjectController,
  updateProjectController,
  deleteProjectController,
};
