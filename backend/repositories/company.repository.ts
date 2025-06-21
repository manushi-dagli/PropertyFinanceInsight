import logger from "../config/logger";
import { company, Prisma } from "../generated/prisma";
import db from "../config/prisma";

const getCompanyListByWhereCondition = async (
  whereCondition: Prisma.companyWhereInput,
  selectPayload: Prisma.companySelect
): Promise<company[]> => {
  logger.info(
    "getCompanyListByWhereCondition: Request received to fetch company list with where condition"
  );

  const response = await db.company.findMany({
    where: whereCondition,
    select: selectPayload,
  });

  return response;
};

const createCompanyRepository = async (
  payload: Prisma.companyCreateInput
): Promise<string> => {
  logger.info("createCompany: Request received to create a new company");

  const response = await db.company.create({
    data: payload,
  });

  return response.id;
};

const getCompanyByWhereCondition = async (
  whereCondition: Prisma.companyWhereInput,
  selectPayload?: Prisma.companySelect
): Promise<company | null> => {
  logger.info(
    "getCompanyByWhereCondition: Request received to fetch company by where condition"
  );

  const response = await db.company.findFirst({
    where: whereCondition,
    select: selectPayload,
  });

  return response;
};

const updateCompanyRepository = async (
  whereCondition: Prisma.companyWhereUniqueInput,
  data: Prisma.companyUpdateInput
): Promise<company> => {
  logger.info(`updateCompanyRepository: Request received to update company `);

  return await db.company.update({
    where: whereCondition,
    data: data,
  });
};

export {
  getCompanyListByWhereCondition,
  createCompanyRepository,
  getCompanyByWhereCondition,
  updateCompanyRepository,
};
