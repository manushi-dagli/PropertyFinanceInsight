import { supabase } from "../lib/supabase";

export interface BookingData {
  id?: string;
  customer_id: string;
  flat_id: string;
  payment_date?: string;
  payer_name?: string;
  mode_of_payment?: string;
  amount_paid?: number;
  customer_bank_name?: string;
  customer_account_no?: string;
  company_bank_name?: string;
  company_account_no?: string;
  agreement_value?: number;
  booking_amount?: number;
  outstanding_amount?: number;
}

export const createBookingApi = async (data: BookingData) => {
  const { data: result, error } = await supabase
    .from("bookings")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const getBookingsListApi = async () => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("payment_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getBookingsByCustomerApi = async (customerId: string) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("payment_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
};

export const updateBookingApi = async (data: Partial<BookingData>, id: string) => {
  const { data: result, error } = await supabase
    .from("bookings")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const deleteBookingApi = async (id: string) => {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return { success: true };
};

