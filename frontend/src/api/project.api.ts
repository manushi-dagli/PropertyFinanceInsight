import { supabase } from "../lib/supabase";

export interface ProjectApiData {
  company_id: string;
  project_name: string;
  total_area?: number;
  estimated_land_cost?: number;
  estimated_construction_cost?: number;
  total_estimated_cost?: number;
  report_date?: string;
  actual_land_cost?: number;
  actual_construction_cost?: number;
  total_actual_cost?: number;
  project_completion_percentage?: string;
  construction_percentage?: string;
  revenue_recognized?: boolean;
}

export const createProjectApi = async (data: ProjectApiData) => {
  const { data: result, error } = await supabase
    .from("project")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getProjectsListApi = async () => {
  const { data, error } = await supabase
    .from("project")
    .select(`
      *,
      company:company_id (
        company_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  // Map the joined company data
  return (data || []).map((project: any) => ({
    ...project,
    company_name: project.company?.company_name || null,
  }));
};

export const updateProjectApi = async (data: Partial<ProjectApiData>, id: string) => {
  const { data: result, error } = await supabase
    .from("project")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteProjectApi = async (id: string) => {
  const { error } = await supabase
    .from("project")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};
