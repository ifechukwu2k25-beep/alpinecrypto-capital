export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          country: string | null;
          residency_region: string | null;
          investor_type: string | null;
          balance: number | null;
          role: string | null;
          created_at: string;
          updated_at: string;
          is_frozen: boolean;
        };
        Insert: {
          id: string;
          email: string;
          country?: string | null;
          residency_region?: string | null;
          investor_type?: string | null;
          balance?: number | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
          is_frozen?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          country?: string | null;
          residency_region?: string | null;
          investor_type?: string | null;
          balance?: number | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
          is_frozen?: boolean;
        };
      };
      investment_plans: {
        Row: {
          id: string;
          plan_key: string;
          name: string;
          description: string | null;
          min_amount: number;
          max_amount: number | null;
          tier_rank: number;
          roi_min: number;
          roi_max: number;
          roi_frequency: "daily" | "weekly";
          lock_days: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_key: string;
          name: string;
          description?: string | null;
          min_amount: number;
          max_amount?: number | null;
          tier_rank?: number;
          roi_min?: number;
          roi_max?: number;
          roi_frequency?: "daily" | "weekly";
          lock_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_key?: string;
          name?: string;
          description?: string | null;
          min_amount?: number;
          max_amount?: number | null;
          tier_rank?: number;
          roi_min?: number;
          roi_max?: number;
          roi_frequency?: "daily" | "weekly";
          lock_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_plans: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          plan_key: string;
          plan_name: string;
          invested_amount: number;
          current_balance: number;
          total_earned: number;
          status: "active" | "completed" | "cancelled";
          lock_until: string | null;
          last_roi_calculation: string | null;
          next_roi_calculation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          plan_key: string;
          plan_name: string;
          invested_amount: number;
          current_balance?: number;
          total_earned?: number;
          status?: "active" | "completed" | "cancelled";
          lock_until?: string | null;
          last_roi_calculation?: string | null;
          next_roi_calculation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          plan_key?: string;
          plan_name?: string;
          invested_amount?: number;
          current_balance?: number;
          total_earned?: number;
          status?: "active" | "completed" | "cancelled";
          lock_until?: string | null;
          last_roi_calculation?: string | null;
          next_roi_calculation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_transactions: {
        Row: {
          id: string;
          user_id: string;
          transaction_type: "deposit" | "withdrawal" | "investment" | "roi" | "fee" | "refund";
          amount: number;
          fee_amount: number;
          status: "pending" | "completed" | "failed" | "cancelled";
          description: string | null;
          reference_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          transaction_type: "deposit" | "withdrawal" | "investment" | "roi" | "fee" | "refund";
          amount: number;
          fee_amount?: number;
          status?: "pending" | "completed" | "failed" | "cancelled";
          description?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          transaction_type?: "deposit" | "withdrawal" | "investment" | "roi" | "fee" | "refund";
          amount?: number;
          fee_amount?: number;
          status?: "pending" | "completed" | "failed" | "cancelled";
          description?: string | null;
          reference_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roi_history: {
        Row: {
          id: string;
          user_plan_id: string;
          user_id: string;
          roi_amount: number;
          roi_percentage: number;
          balance_before: number;
          balance_after: number;
          calculation_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_plan_id: string;
          user_id: string;
          roi_amount: number;
          roi_percentage: number;
          balance_before: number;
          balance_after: number;
          calculation_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_plan_id?: string;
          user_id?: string;
          roi_amount?: number;
          roi_percentage?: number;
          balance_before?: number;
          balance_after?: number;
          calculation_date?: string;
          created_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          fee_amount: number;
          net_amount: number;
          currency: string;
          user_wallet_address: string;
          network: string | null;
          status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          transaction_hash: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          fee_amount?: number;
          net_amount: number;
          currency?: string;
          user_wallet_address: string;
          network?: string | null;
          status?: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          transaction_hash?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          fee_amount?: number;
          net_amount?: number;
          currency?: string;
          user_wallet_address?: string | null;
          network?: string | null;
          status?: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          transaction_hash?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      deposits: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          wallet_address: string;
          transaction_hash: string | null;
          proof_url: string | null;
          status: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          wallet_address: string;
          transaction_hash?: string | null;
          proof_url?: string | null;
          status?: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          wallet_address?: string;
          transaction_hash?: string | null;
          proof_url?: string | null;
          status?: "pending" | "processing" | "completed" | "rejected" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
      };
      allocation_requests: {
        Row: {
          id: string;
          user_id: string;
          strategy_type: string;
          requested_amount: number;
          status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          strategy_type: string;
          requested_amount: number;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          strategy_type?: string;
          requested_amount?: number;
          status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };
      allocations: {
        Row: {
          id: string;
          user_id: string;
          strategy_type: string;
          allocated_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          strategy_type: string;
          allocated_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          strategy_type?: string;
          allocated_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      portfolio_valuations: {
        Row: {
          id: string;
          user_id: string;
          valuation_date: string;
          portfolio_value: number;
          strategy_exposure: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          valuation_date: string;
          portfolio_value: number;
          strategy_exposure: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          valuation_date?: string;
          portfolio_value?: number;
          strategy_exposure?: Json;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
