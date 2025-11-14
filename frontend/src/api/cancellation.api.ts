import { supabase } from "../lib/supabase";

export interface CancellationData {
  id?: string;
  customer_id: string;
  flat_id: string;
  refund_date?: string;
  payee_name?: string;
  mode_of_payment?: string;
  amount_refunded?: number;
  customer_bank_name?: string;
  customer_account_no?: string;
  company_bank_name?: string;
  company_account_no?: string;
  remarks?: string;
}

export const createCancellationApi = async (data: CancellationData) => {
  const { data: result, error } = await supabase
    .from("cancellations")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getCancellationsListApi = async () => {
  const { data, error } = await supabase
    .from("cancellations")
    .select("*")
    .order("refund_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getCancellationsByCustomerApi = async (customerId: string) => {
  const { data, error } = await supabase
    .from("cancellations")
    .select("*")
    .eq("customer_id", customerId)
    .order("refund_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const updateCancellationApi = async (data: Partial<CancellationData>, id: string) => {
  const { data: result, error } = await supabase
    .from("cancellations")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteCancellationApi = async (id: string) => {
  const { error } = await supabase
    .from("cancellations")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

