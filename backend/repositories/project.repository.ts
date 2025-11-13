import logger from "../config/logger";
import { project, Prisma } from "../generated/prisma";
import db from "../config/prisma";

const getProjectListByWhereCondition = async (
  whereCondition: Prisma.projectWhereInput,
  selectPayload?: Prisma.projectSelect
): Promise<Array<Partial<project & { company: { company_name: string } }>>> => {
  logger.info(
    "getProjectListByWhereCondition: Request received to fetch project list with where condition"
  );
  const projects = await db.project.findMany({
    where: whereCondition,
    select: selectPayload,
  });
  logger.info(
    `getProjectListByWhereCondition: Fetched ${projects.length} projects`
  );
  return projects;
};

const createProjectRepository = async (
  payload: Prisma.projectCreateInput
): Promise<string> => {
  logger.info(
    "createProjectRepository: Request received to create a new project"
  );
  const projectCreated = await db.project.create({
    data: payload,
  });
  logger.info(
    `createProjectRepository: Project created with ID ${projectCreated.id}`
  );
  return projectCreated.id;
};

const getProjectByWhereCondition = async (
  whereCondition: Prisma.projectWhereInput,
  selectPayload?: Prisma.projectSelect
): Promise<project | null> => {
  logger.info(
    "getProjectByWhereCondition: Request received to fetch project by where condition"
  );
  const project = await db.project.findFirst({
    where: whereCondition,
    select: selectPayload,
  });
  return project;
};

const updateProjectRepository = async (
  whereCondition: Prisma.projectWhereUniqueInput,
  data: Prisma.projectUpdateInput
): Promise<project> => {
  logger.info(`updateProjectRepository: Request received to update project`);
  const updatedProject = await db.project.update({
    where: whereCondition,
    data: data,
  });
  return updatedProject;
};

export {
  getProjectListByWhereCondition,
  createProjectRepository,
  getProjectByWhereCondition,
  updateProjectRepository,
};
