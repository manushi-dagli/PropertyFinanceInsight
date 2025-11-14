import { supabase } from "../lib/supabase";

export interface WingData {
  id?: string;
  wing_name: string;
  project_id: string;
  project_name?: string;
  company_name?: string;
  construction_area: number;
}

export const createWingApi = async (data: WingData) => {
  const { data: result, error } = await supabase
    .from("wing")
    .insert([data])
    .select(`
      *,
      project:project_id (
        project_name,
        company:company_id (
          company_name
        )
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  // Map the joined data to include project_name and company_name directly
  return {
    ...result,
    project_name: result.project?.project_name || null,
    company_name: result.project?.company?.company_name || null,
  };
};

export const getWingsListApi = async () => {
  const { data, error } = await supabase
    .from("wing")
    .select(`
      *,
      project:project_id (
        project_name,
        company:company_id (
          company_name
        )
      )
    `)
    .order("wing_name", { ascending: true });

  if (error) {
    throw error;
  }

  // Map the joined data to include project_name and company_name directly
  return (data || []).map((wing: any) => ({
    ...wing,
    project_name: wing.project?.project_name || null,
    company_name: wing.project?.company?.company_name || null,
  }));
};

export const getWingsByProjectApi = async (projectId: string) => {
  const { data, error } = await supabase
    .from("wing")
    .select(`
      *,
      project:project_id (
        project_name,
        company:company_id (
          company_name
        )
      )
    `)
    .eq("project_id", projectId)
    .order("wing_name", { ascending: true });

  if (error) {
    throw error;
  }

  // Map the joined data to include project_name and company_name directly
  return (data || []).map((wing: any) => ({
    ...wing,
    project_name: wing.project?.project_name || null,
    company_name: wing.project?.company?.company_name || null,
  }));
};

export const updateWingApi = async (data: Partial<WingData>, id: string) => {
  const { data: result, error } = await supabase
    .from("wing")
    .update(data)
    .eq("id", id)
    .select(`
      *,
      project:project_id (
        project_name,
        company:company_id (
          company_name
        )
      )
    `)
    .single();

  if (error) {
    throw error;
  }

  // Map the joined data to include project_name and company_name directly
  return {
    ...result,
    project_name: result.project?.project_name || null,
    company_name: result.project?.company?.company_name || null,
  };
};

export const deleteWingApi = async (id: string) => {
  const { error } = await supabase
    .from("wing")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

