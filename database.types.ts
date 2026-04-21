export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      household_members: {
        Row: {
          dob: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          membership_id: string
          phone: string | null
          relationship_to_primary: string
        }
        Insert: {
          dob?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          membership_id: string
          phone?: string | null
          relationship_to_primary: string
        }
        Update: {
          dob?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          membership_id?: string
          phone?: string | null
          relationship_to_primary?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          code: Database["public"]["Enums"]["membership_plan_code"]
          is_active: boolean
          max_additional_members: number
          name: string
          price_cents: number | null
        }
        Insert: {
          code: Database["public"]["Enums"]["membership_plan_code"]
          is_active?: boolean
          max_additional_members: number
          name: string
          price_cents?: number | null
        }
        Update: {
          code?: Database["public"]["Enums"]["membership_plan_code"]
          is_active?: boolean
          max_additional_members?: number
          name?: string
          price_cents?: number | null
        }
        Relationships: []
      }
      memberships: {
        Row: {
          approved_at: string | null
          created_at: string
          id: string
          membership_year: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          plan_code: Database["public"]["Enums"]["membership_plan_code"]
          primary_user_id: string
          status: Database["public"]["Enums"]["membership_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          id?: string
          membership_year: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_code: Database["public"]["Enums"]["membership_plan_code"]
          primary_user_id: string
          status?: Database["public"]["Enums"]["membership_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          id?: string
          membership_year?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          plan_code?: Database["public"]["Enums"]["membership_plan_code"]
          primary_user_id?: string
          status?: Database["public"]["Enums"]["membership_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "memberships_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      officer_accounts: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "officer_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_records: {
        Row: {
          amount_cents: number | null
          id: string
          membership_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          received_at: string
          received_by: string
          reference: string
        }
        Insert: {
          amount_cents?: number | null
          id?: string
          membership_id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          received_at?: string
          received_by: string
          reference: string
        }
        Update: {
          amount_cents?: number | null
          id?: string
          membership_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          received_at?: string
          received_by?: string
          reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          dob: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          occupation: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          dob?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          dob?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          occupation?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_record_payment: {
        Args: {
          p_mark_active?: boolean
          p_membership_id: string
          p_notes?: string
          p_reference?: string
        }
        Returns: undefined
      }
      is_officer: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      submit_membership_application: {
        Args: {
          p_household_members?: Json
          p_membership_year: string
          p_payment_method: Database["public"]["Enums"]["payment_method"]
          p_payment_reference?: string
          p_plan_code: Database["public"]["Enums"]["membership_plan_code"]
          p_profile: Json
        }
        Returns: string
      }
    }
    Enums: {
      membership_plan_code: "single" | "couple" | "family"
      membership_status: "draft" | "submitted" | "active" | "expired" | "cancelled"
      payment_method: "zelle" | "check" | "cash" | "other" | "none"
      payment_status: "pending" | "paid" | "waived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      membership_plan_code: ["single", "couple", "family"],
      membership_status: ["draft", "submitted", "active", "expired", "cancelled"],
      payment_method: ["zelle", "check", "cash", "other", "none"],
      payment_status: ["pending", "paid", "waived"],
    },
  },
} as const
