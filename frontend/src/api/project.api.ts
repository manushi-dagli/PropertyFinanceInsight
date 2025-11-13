
import { ProjectData } from "@/types/project.types";
import api from "./../config/apiConfig";

export const createProjectApi = async (data: ProjectData) => {
  const response = await api.post("/api/project", data);

  return response.data;
};

export const getProjectsListApi = async () => {
  const response = await api.get("/api/project");

  return response.data;
};

export const updateProjectApi = async (data: ProjectData, id: string) => {
  const response = await api.put(`/api/project/${id}`, data);

  return response.data;
}

export const deleteProjectApi = async (id: string) => {
  const response = await api.delete(`/api/project/${id}`);

  return response.data;
};
