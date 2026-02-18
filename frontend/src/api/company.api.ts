import { supabase } from "../lib/supabase";

export interface CompanyApiData {
  company_name: string;
  email_address?: string;
  company_address?: string;
  contact_number?: string;
  gst_number?: string;
  pan_number?: string;
  cin_number?: string;
  contact_person_name?: string;
}

export const createCompanyApi = async (data: CompanyApiData) => {
  const { data: result, error } = await supabase
    .from("company")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getCompaniesListApi = async () => {
  const { data, error } = await supabase
    .from("company")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const updateCompanyApi = async (data: Partial<CompanyApiData>, id: string) => {
  const { data: result, error } = await supabase
    .from("company")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteCompanyApi = async (id: string) => {
  const { error } = await supabase
    .from("company")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};
