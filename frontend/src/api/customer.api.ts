import { supabase } from "../lib/supabase";

export interface CustomerData {
  id?: string;
  customer_name?: string;
  flat_id?: string;
  contact_number?: number;
  email?: string;
  aadhar_number?: string;
  address?: string;
  pin_code?: number;
}

export const createCustomerApi = async (data: CustomerData) => {
  const { data: result, error } = await supabase
    .from("customer")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getCustomersListApi = async () => {
  const { data, error } = await supabase
    .from("customer")
    .select("*")
    .order("customer_name", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getCustomerByFlatApi = async (flatId: string) => {
  const { data, error } = await supabase
    .from("customer")
    .select("*")
    .eq("flat_id", flatId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const updateCustomerApi = async (data: Partial<CustomerData>, id: string) => {
  const { data: result, error } = await supabase
    .from("customer")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteCustomerApi = async (id: string) => {
  const { error } = await supabase
    .from("customer")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

