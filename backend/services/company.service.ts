import logger from "../config/logger";
import { Prisma } from "../generated/prisma";
import {
  createCompanyRepository,
  getCompanyByWhereCondition,
  getCompanyListByWhereCondition,
  updateCompanyRepository,
} from "../repositories/company.repository";
import { CreateCompanyPayload, UpdateCompanyPayload } from "../types/company.type";
import { ApiError } from "../utils/response.handler";
import { constants } from "http2";
import { messages } from "../utils/messages";

const getCompanyListService = async () => {
  logger.info("getCompanyListService: Request received to fetch company list");

  const companyList = await getCompanyListByWhereCondition(
    {
      is_active: true,
    },
    {
      id: true,
      company_name: true,
      email_address: true,
      company_address: true,
      contact_number: true,
      gst_number: true,
      pan_number: true,
      cin_number: true,
      contact_person_name: true,
    }
  );

  return companyList.map((company) => ({
    id: company.id,
    companyName: company.company_name,
    emailAddress: company.email_address,
    companyAddress: company.company_address,
    contactNumber: company.contact_number,
    gstNumber: company.gst_number,
    panNumber: company.pan_number,
    cinNumber: company.cin_number,
    contactPersonName: company.contact_person_name,
  }));
};

const createCompanyService = async (payload: CreateCompanyPayload) => {
  logger.info("createCompanyService: Request received to create a new company");

  const data: Prisma.companyCreateInput = {
    company_name: payload.companyName,
    email_address: payload.emailAddress,
    company_address: payload.companyAddress,
    contact_number: payload.contactNumber,
    gst_number: payload.gstNumber,
    pan_number: payload.panNumber,
    cin_number: payload.cinNumber,
    contact_person_name: payload.contactPersonName,
  };

  const companyId = await createCompanyRepository(data);

  logger.info(`createCompanyService: Company created with ID ${companyId}`);
  return companyId;
};

const updateCompanyDetailsService = async (
  companyId: string,
  payload: UpdateCompanyPayload
): Promise<void> => {
  logger.info(
    "updateCompanyDetailsService: Request received to update a company"
  );

  const company = await getCompanyByWhereCondition({
    id: companyId,
  });

  if (!company) {
    logger.error(
      `updateCompanyDetailsService: No company found with ID ${companyId}`
    );
    throw new ApiError(
      constants.HTTP_STATUS_NOT_FOUND,
      messages.COMPANY_NOT_FOUND
    );
  }

  const data: Prisma.companyUpdateInput = {
    company_name: payload.companyName,
    email_address: payload.emailAddress,
    company_address: payload.companyAddress,
    contact_number: payload.contactNumber,
    gst_number: payload.gstNumber,
    pan_number: payload.panNumber,
    cin_number: payload.cinNumber,
    contact_person_name: payload.contactPersonName,
  };
  await updateCompanyRepository(
    {
      id: companyId,
    },
    data
  );
};

const deleteCompanyService = async (companyId: string): Promise<void> => {
  logger.info("deleteCompanyService: Request received to delete a company");

  const company = await getCompanyByWhereCondition({
    id: companyId,
  });

  if (!company) {
    logger.error(`deleteCompanyService: No company found with ID ${companyId}`);
    throw new ApiError(
      constants.HTTP_STATUS_NOT_FOUND,
      messages.COMPANY_NOT_FOUND
    );
  }

  await updateCompanyRepository(
    {
      id: companyId,
    },
    {
      is_active: false,
    }
  );

  logger.info(`deleteCompanyService: Company with ID ${companyId} deleted`);
};

export {
  getCompanyListService,
  createCompanyService,
  updateCompanyDetailsService,
  deleteCompanyService,
};
