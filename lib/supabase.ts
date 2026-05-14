import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const USER_ID = process.env.WEB_USER_ID!;

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: number;
  deadline?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  user_id: string;
  item: string;
  quantity?: string;
  checked: boolean;
  created_at: string;
}
