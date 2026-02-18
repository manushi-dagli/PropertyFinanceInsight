import { supabase } from "../lib/supabase";

export interface FlatData {
  id?: string;
  flat_number: string;
  wing_id: string;
  carpet_area?: number;
  status?: string;
  agreement_value?: number;
}

export const createFlatApi = async (data: FlatData) => {
  const { data: result, error } = await supabase
    .from("flat")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getFlatsListApi = async () => {
  const { data, error } = await supabase
    .from("flat")
    .select("*")
    .order("flat_number", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getFlatsByWingApi = async (wingId: string) => {
  const { data, error } = await supabase
    .from("flat")
    .select("*")
    .eq("wing_id", wingId)
    .order("flat_number", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const updateFlatApi = async (data: Partial<FlatData>, id: string) => {
  const { data: result, error } = await supabase
    .from("flat")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteFlatApi = async (id: string) => {
  const { error } = await supabase
    .from("flat")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

