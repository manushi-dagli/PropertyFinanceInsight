import { CompanyData } from "./../types/company.types";
import api from "./../config/apiConfig";

export const createCompanyApi = async (data: CompanyData) => {
  const response = await api.post("/api/company", data);

  return response.data;
};

export const getCompaniesListApi = async () => {
  const response = await api.get("/api/company");

  return response.data;
};

export const updateCompanyApi = async (data: CompanyData, id: string) => {
  const response = await api.put(`/api/company/${id}`, data);

  return response.data;
}

export const deleteCompanyApi = async (id: string) => {
  const response = await api.delete(`/api/company/${id}`);

  return response.data;
};
