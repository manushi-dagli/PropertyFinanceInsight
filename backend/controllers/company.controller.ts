import { type Request, type Response } from "express";
import logger from "../config/logger";
import {
  createCompanyService,
  deleteCompanyService,
  getCompanyListService,
  updateCompanyDetailsService,
} from "../services/company.service";
import {
  ApiError,
  ApiResponse,
  ControllerResponse,
} from "../utils/response.handler";
import { constants } from "http2";
import { messages } from "../utils/messages";

const getCompanyListController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info(
    "getCompanyListController: Request received to fetch company list"
  );

  const response = await getCompanyListService();

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.COMPANY_LIST_FETCHED_SUCCESSFULLY,
    response
  ).send(res);
};

const createCompanyController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info(
    "createCompanyController: Request received to create a new company"
  );

  const response = await createCompanyService(req.body);

  return new ApiResponse(
    constants.HTTP_STATUS_CREATED,
    messages.COMPANY_CREATED_SUCCESSFULLY,
    { id: response }
  ).send(res);
};

const updateCompanyController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info("updateCompanyController: Request received to update a company");

  const companyId = req.params.companyId;

  if (!companyId) {
    throw new ApiError(
      constants.HTTP_STATUS_BAD_REQUEST,
      messages.COMPANY_ID_REQUIRED
    );
  }

  await updateCompanyDetailsService(companyId, req.body);

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.COMPANY_UPDATED_SUCCESSFULLY,
    {}
  ).send(res);
};

const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<ControllerResponse> => {
  logger.info("deleteCompanyController: Request received to delete a company");

  const companyId = req.params.companyId;

  if (!companyId) {
    throw new ApiError(
      constants.HTTP_STATUS_BAD_REQUEST,
      messages.COMPANY_ID_REQUIRED
    );
  }
  await deleteCompanyService(companyId);

  return new ApiResponse(
    constants.HTTP_STATUS_OK,
    messages.COMPANY_DELETED_SUCCESSFULLY,
    {}
  ).send(res);
};

export {
  getCompanyListController,
  createCompanyController,
  updateCompanyController,
  deleteCompanyController,
};
