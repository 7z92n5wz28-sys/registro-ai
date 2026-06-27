export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_evidences: {
        Row: {
          ai_confidence: Database["public"]["Enums"]["ai_confidence_level"]
          ai_proposed_value: string | null
          ai_rationale: string | null
          ai_source_snippet: string | null
          ai_source_url: string | null
          created_at: string
          evaluation_id: string
          id: string
          parameter_key: string
          user_accepted: boolean | null
          user_override_value: string | null
        }
        Insert: {
          ai_confidence: Database["public"]["Enums"]["ai_confidence_level"]
          ai_proposed_value?: string | null
          ai_rationale?: string | null
          ai_source_snippet?: string | null
          ai_source_url?: string | null
          created_at?: string
          evaluation_id: string
          id?: string
          parameter_key: string
          user_accepted?: boolean | null
          user_override_value?: string | null
        }
        Update: {
          ai_confidence?: Database["public"]["Enums"]["ai_confidence_level"]
          ai_proposed_value?: string | null
          ai_rationale?: string | null
          ai_source_snippet?: string | null
          ai_source_url?: string | null
          created_at?: string
          evaluation_id?: string
          id?: string
          parameter_key?: string
          user_accepted?: boolean | null
          user_override_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_evidences_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_evidences_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "v_evaluation_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_systems: {
        Row: {
          activities_amministrazione:
            | Database["public"]["Enums"]["activity_type_amministrazione"][]
            | null
          activities_didattica:
            | Database["public"]["Enums"]["activity_type_didattica"][]
            | null
          activity_area: Database["public"]["Enums"]["activity_area"]
          adoption_date: string | null
          categories: Database["public"]["Enums"]["tool_category"][]
          created_at: string
          created_by: string | null
          dismissed_at: string | null
          id: string
          institution_id: string
          is_active: boolean
          name: string
          notes: string | null
          provider: string
          responsible_person: string | null
          subjects: Database["public"]["Enums"]["subject_type"][]
          updated_at: string
          website_url: string | null
        }
        Insert: {
          activities_amministrazione?:
            | Database["public"]["Enums"]["activity_type_amministrazione"][]
            | null
          activities_didattica?:
            | Database["public"]["Enums"]["activity_type_didattica"][]
            | null
          activity_area: Database["public"]["Enums"]["activity_area"]
          adoption_date?: string | null
          categories: Database["public"]["Enums"]["tool_category"][]
          created_at?: string
          created_by?: string | null
          dismissed_at?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          name: string
          notes?: string | null
          provider: string
          responsible_person?: string | null
          subjects: Database["public"]["Enums"]["subject_type"][]
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          activities_amministrazione?:
            | Database["public"]["Enums"]["activity_type_amministrazione"][]
            | null
          activities_didattica?:
            | Database["public"]["Enums"]["activity_type_didattica"][]
            | null
          activity_area?: Database["public"]["Enums"]["activity_area"]
          adoption_date?: string | null
          categories?: Database["public"]["Enums"]["tool_category"][]
          created_at?: string
          created_by?: string | null
          dismissed_at?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          provider?: string
          responsible_person?: string | null
          subjects?: Database["public"]["Enums"]["subject_type"][]
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_systems_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_systems_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_results: {
        Row: {
          content_markdown: string | null
          crawl_type: string
          crawled_at: string
          evaluation_id: string | null
          id: string
          raw_metadata: Json | null
          url: string
        }
        Insert: {
          content_markdown?: string | null
          crawl_type: string
          crawled_at?: string
          evaluation_id?: string | null
          id?: string
          raw_metadata?: Json | null
          url: string
        }
        Update: {
          content_markdown?: string | null
          crawl_type?: string
          crawled_at?: string
          evaluation_id?: string | null
          id?: string
          raw_metadata?: Json | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "crawl_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crawl_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "v_evaluation_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_logs: {
        Row: {
          action: string
          details: Json | null
          evaluation_id: string | null
          id: string
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          evaluation_id?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          evaluation_id?: string | null
          id?: string
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_logs_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_logs_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "v_evaluation_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          ai_system_id: string
          compliance_requirements: string[] | null
          created_at: string
          created_by: string | null
          dpo_acn_marketplace: boolean | null
          dpo_auto_verdict: string | null
          dpo_conditions: string | null
          dpo_dpa: boolean | null
          dpo_effective_ai_usage: boolean | null
          dpo_extra_data_required: boolean | null
          dpo_final_verdict: Database["public"]["Enums"]["dpo_verdict"] | null
          dpo_marketing: boolean | null
          dpo_motivations: string | null
          dpo_prescriptions: string | null
          dpo_reviewed_at: string | null
          dpo_reviewed_by: string | null
          dpo_score: number | null
          dpo_server_eu: boolean | null
          has_prohibited_practice: boolean | null
          id: string
          institution_id: string
          prohibited_access_determination: boolean | null
          prohibited_biometric_categorization: boolean | null
          prohibited_emotion_recognition: boolean | null
          prohibited_social_scoring: boolean | null
          prohibited_vulnerability_manipulation: boolean | null
          recommendation: string | null
          registered_at: string | null
          risk_classification_rationale: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          school_year: string
          status: Database["public"]["Enums"]["evaluation_status"]
          updated_at: string
          version: number
        }
        Insert: {
          ai_system_id: string
          compliance_requirements?: string[] | null
          created_at?: string
          created_by?: string | null
          dpo_acn_marketplace?: boolean | null
          dpo_auto_verdict?: string | null
          dpo_conditions?: string | null
          dpo_dpa?: boolean | null
          dpo_effective_ai_usage?: boolean | null
          dpo_extra_data_required?: boolean | null
          dpo_final_verdict?: Database["public"]["Enums"]["dpo_verdict"] | null
          dpo_marketing?: boolean | null
          dpo_motivations?: string | null
          dpo_prescriptions?: string | null
          dpo_reviewed_at?: string | null
          dpo_reviewed_by?: string | null
          dpo_score?: number | null
          dpo_server_eu?: boolean | null
          has_prohibited_practice?: boolean | null
          id?: string
          institution_id: string
          prohibited_access_determination?: boolean | null
          prohibited_biometric_categorization?: boolean | null
          prohibited_emotion_recognition?: boolean | null
          prohibited_social_scoring?: boolean | null
          prohibited_vulnerability_manipulation?: boolean | null
          recommendation?: string | null
          registered_at?: string | null
          risk_classification_rationale?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          school_year: string
          status?: Database["public"]["Enums"]["evaluation_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          ai_system_id?: string
          compliance_requirements?: string[] | null
          created_at?: string
          created_by?: string | null
          dpo_acn_marketplace?: boolean | null
          dpo_auto_verdict?: string | null
          dpo_conditions?: string | null
          dpo_dpa?: boolean | null
          dpo_effective_ai_usage?: boolean | null
          dpo_extra_data_required?: boolean | null
          dpo_final_verdict?: Database["public"]["Enums"]["dpo_verdict"] | null
          dpo_marketing?: boolean | null
          dpo_motivations?: string | null
          dpo_prescriptions?: string | null
          dpo_reviewed_at?: string | null
          dpo_reviewed_by?: string | null
          dpo_score?: number | null
          dpo_server_eu?: boolean | null
          has_prohibited_practice?: boolean | null
          id?: string
          institution_id?: string
          prohibited_access_determination?: boolean | null
          prohibited_biometric_categorization?: boolean | null
          prohibited_emotion_recognition?: boolean | null
          prohibited_social_scoring?: boolean | null
          prohibited_vulnerability_manipulation?: boolean | null
          recommendation?: string | null
          registered_at?: string | null
          risk_classification_rationale?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          school_year?: string
          status?: Database["public"]["Enums"]["evaluation_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "v_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_dpo_reviewed_by_fkey"
            columns: ["dpo_reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          id: string
          name: string
          school_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          school_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          school_code?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          full_name: string
          id: string
          institution_id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          institution_id: string
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          institution_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_evaluation_detail: {
        Row: {
          activity_area: Database["public"]["Enums"]["activity_area"] | null
          ai_system_id: string | null
          categories: Database["public"]["Enums"]["tool_category"][] | null
          compliance_requirements: string[] | null
          created_at: string | null
          created_by: string | null
          dpo_acn_marketplace: boolean | null
          dpo_auto_verdict: string | null
          dpo_conditions: string | null
          dpo_dpa: boolean | null
          dpo_effective_ai_usage: boolean | null
          dpo_extra_data_required: boolean | null
          dpo_final_verdict: Database["public"]["Enums"]["dpo_verdict"] | null
          dpo_marketing: boolean | null
          dpo_motivations: string | null
          dpo_prescriptions: string | null
          dpo_reviewed_at: string | null
          dpo_reviewed_by: string | null
          dpo_score: number | null
          dpo_server_eu: boolean | null
          evidences: Json | null
          has_prohibited_practice: boolean | null
          id: string | null
          institution_id: string | null
          is_active: boolean | null
          prohibited_access_determination: boolean | null
          prohibited_biometric_categorization: boolean | null
          prohibited_emotion_recognition: boolean | null
          prohibited_social_scoring: boolean | null
          prohibited_vulnerability_manipulation: boolean | null
          provider: string | null
          recommendation: string | null
          registered_at: string | null
          risk_classification_rationale: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          school_year: string | null
          status: Database["public"]["Enums"]["evaluation_status"] | null
          subjects: Database["public"]["Enums"]["subject_type"][] | null
          system_name: string | null
          updated_at: string | null
          version: number | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "ai_systems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_ai_system_id_fkey"
            columns: ["ai_system_id"]
            isOneToOne: false
            referencedRelation: "v_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_dpo_reviewed_by_fkey"
            columns: ["dpo_reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      v_registry: {
        Row: {
          activities_amministrazione:
            | Database["public"]["Enums"]["activity_type_amministrazione"][]
            | null
          activities_didattica:
            | Database["public"]["Enums"]["activity_type_didattica"][]
            | null
          activity_area: Database["public"]["Enums"]["activity_area"] | null
          adoption_date: string | null
          categories: Database["public"]["Enums"]["tool_category"][] | null
          created_at: string | null
          created_by: string | null
          dismissed_at: string | null
          dpo_auto_verdict: string | null
          dpo_final_verdict: Database["public"]["Enums"]["dpo_verdict"] | null
          dpo_score: number | null
          id: string | null
          institution_id: string | null
          is_active: boolean | null
          name: string | null
          notes: string | null
          provider: string | null
          registered_at: string | null
          responsible_person: string | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          school_year: string | null
          status: Database["public"]["Enums"]["evaluation_status"] | null
          subjects: Database["public"]["Enums"]["subject_type"][] | null
          updated_at: string | null
          version: number | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_systems_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_systems_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_area: "didattica" | "amministrazione"
      activity_type_amministrazione:
        | "circulars"
        | "documents"
        | "spreadsheets"
        | "admin"
        | "chatbot"
        | "schedules"
        | "pnrr"
        | "other"
      activity_type_didattica:
        | "teaching_materials"
        | "presentations"
        | "quiz"
        | "maps"
        | "images"
        | "content"
        | "text_synthesis"
        | "translations"
        | "tutoring"
        | "bes_dsa"
        | "languages"
        | "coding"
        | "research"
        | "transcription"
        | "podcast"
        | "video"
        | "other"
      ai_confidence_level: "inferred" | "to_verify"
      dpo_verdict:
        | "approved"
        | "approved_with_conditions"
        | "rejected"
        | "pending"
      evaluation_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "approved_with_conditions"
        | "rejected"
        | "archived"
      risk_level: "unacceptable" | "high" | "limited" | "minimal"
      subject_type:
        | "students"
        | "minor_students"
        | "teachers"
        | "ata"
        | "families"
        | "staff"
        | "external"
        | "no_personal_data"
        | "other"
      tool_category:
        | "writing_assistant"
        | "chatbot"
        | "image_generator"
        | "presentations"
        | "quiz"
        | "concept_maps"
        | "search"
        | "translation"
        | "tts"
        | "stt"
        | "audio"
        | "video"
        | "image_editing"
        | "adaptive_tutor"
        | "admin_support"
        | "data_analysis"
        | "coding"
        | "accessibility_bes_dsa"
        | "ai_detection"
        | "other"
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
      activity_area: ["didattica", "amministrazione"],
      activity_type_amministrazione: [
        "circulars",
        "documents",
        "spreadsheets",
        "admin",
        "chatbot",
        "schedules",
        "pnrr",
        "other",
      ],
      activity_type_didattica: [
        "teaching_materials",
        "presentations",
        "quiz",
        "maps",
        "images",
        "content",
        "text_synthesis",
        "translations",
        "tutoring",
        "bes_dsa",
        "languages",
        "coding",
        "research",
        "transcription",
        "podcast",
        "video",
        "other",
      ],
      ai_confidence_level: ["inferred", "to_verify"],
      dpo_verdict: [
        "approved",
        "approved_with_conditions",
        "rejected",
        "pending",
      ],
      evaluation_status: [
        "draft",
        "pending_review",
        "approved",
        "approved_with_conditions",
        "rejected",
        "archived",
      ],
      risk_level: ["unacceptable", "high", "limited", "minimal"],
      subject_type: [
        "students",
        "minor_students",
        "teachers",
        "ata",
        "families",
        "staff",
        "external",
        "no_personal_data",
        "other",
      ],
      tool_category: [
        "writing_assistant",
        "chatbot",
        "image_generator",
        "presentations",
        "quiz",
        "concept_maps",
        "search",
        "translation",
        "tts",
        "stt",
        "audio",
        "video",
        "image_editing",
        "adaptive_tutor",
        "admin_support",
        "data_analysis",
        "coding",
        "accessibility_bes_dsa",
        "ai_detection",
        "other",
      ],
    },
  },
} as const

