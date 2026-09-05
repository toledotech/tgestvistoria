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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      checklist_respostas: {
        Row: {
          assinatura_vistoriador: string | null
          concluido_em: string | null
          created_at: string
          empresa_id: string
          fotos: string[]
          id: string
          laudo_pdf_path: string | null
          ordem_vistoria_id: string
          respostas: Json
          template_id: string | null
          updated_at: string
        }
        Insert: {
          assinatura_vistoriador?: string | null
          concluido_em?: string | null
          created_at?: string
          empresa_id: string
          fotos?: string[]
          id?: string
          laudo_pdf_path?: string | null
          ordem_vistoria_id: string
          respostas?: Json
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          assinatura_vistoriador?: string | null
          concluido_em?: string | null
          created_at?: string
          empresa_id?: string
          fotos?: string[]
          id?: string
          laudo_pdf_path?: string | null
          ordem_vistoria_id?: string
          respostas?: Json
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_respostas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_respostas_ordem_vistoria_id_fkey"
            columns: ["ordem_vistoria_id"]
            isOneToOne: true
            referencedRelation: "ordens_vistoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_respostas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: string
          id: string
          itens: Json
          nome: string
          tipo_vistoria: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: string
          id?: string
          itens?: Json
          nome: string
          tipo_vistoria: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: string
          id?: string
          itens?: Json
          nome?: string
          tipo_vistoria?: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          empresa_id: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      compromissos: {
        Row: {
          created_at: string
          data_hora: string
          descricao: string | null
          empresa_id: string
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_hora: string
          descricao?: string | null
          empresa_id: string
          id?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_hora?: string
          descricao?: string | null
          empresa_id?: string
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          cnpj: string | null
          configuracoes_notificacao: Json
          configuracoes_sistema: Json
          cor_tema: string | null
          created_at: string
          email: string | null
          empresa_id: string
          endereco: string | null
          id: string
          logo_url: string | null
          mercadopago_access_token: string | null
          mercadopago_public_key: string | null
          nome_empresa: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          configuracoes_notificacao?: Json
          configuracoes_sistema?: Json
          cor_tema?: string | null
          created_at?: string
          email?: string | null
          empresa_id: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          mercadopago_access_token?: string | null
          mercadopago_public_key?: string | null
          nome_empresa?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          configuracoes_notificacao?: Json
          configuracoes_sistema?: Json
          cor_tema?: string | null
          created_at?: string
          email?: string | null
          empresa_id?: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          mercadopago_access_token?: string | null
          mercadopago_public_key?: string | null
          nome_empresa?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          id: string
          nome: string
          plano: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          id?: string
          nome: string
          plano?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          created_at?: string
          id?: string
          nome?: string
          plano?: string
          updated_at?: string
        }
        Relationships: []
      }
      ordens_vistoria: {
        Row: {
          checklist_template_id: string | null
          cliente_id: string
          created_at: string
          data_agendada: string | null
          data_realizada: string | null
          empresa_id: string
          id: string
          numero_protocolo: string | null
          observacoes: string | null
          status: Database["public"]["Enums"]["vistoria_status"]
          status_pagamento: Database["public"]["Enums"]["status_pagamento"]
          tipo_vistoria: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at: string
          valor: number
          veiculo_id: string
          vistoriador_id: string | null
        }
        Insert: {
          checklist_template_id?: string | null
          cliente_id: string
          created_at?: string
          data_agendada?: string | null
          data_realizada?: string | null
          empresa_id: string
          id?: string
          numero_protocolo?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["vistoria_status"]
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_vistoria: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at?: string
          valor?: number
          veiculo_id: string
          vistoriador_id?: string | null
        }
        Update: {
          checklist_template_id?: string | null
          cliente_id?: string
          created_at?: string
          data_agendada?: string | null
          data_realizada?: string | null
          empresa_id?: string
          id?: string
          numero_protocolo?: string | null
          observacoes?: string | null
          status?: Database["public"]["Enums"]["vistoria_status"]
          status_pagamento?: Database["public"]["Enums"]["status_pagamento"]
          tipo_vistoria?: Database["public"]["Enums"]["tipo_vistoria"]
          updated_at?: string
          valor?: number
          veiculo_id?: string
          vistoriador_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_vistoria_checklist_template_id_fkey"
            columns: ["checklist_template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_vistoria_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_vistoria_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_vistoria_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_vistoria_vistoriador_id_fkey"
            columns: ["vistoriador_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          empresa_id: string
          gateway: string
          gateway_payment_id: string | null
          id: string
          link_pagamento: string | null
          metodo: Database["public"]["Enums"]["metodo_pagamento"] | null
          ordem_vistoria_id: string
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          empresa_id: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          link_pagamento?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          ordem_vistoria_id: string
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          empresa_id?: string
          gateway?: string
          gateway_payment_id?: string | null
          id?: string
          link_pagamento?: string | null
          metodo?: Database["public"]["Enums"]["metodo_pagamento"] | null
          ordem_vistoria_id?: string
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_ordem_vistoria_id_fkey"
            columns: ["ordem_vistoria_id"]
            isOneToOne: false
            referencedRelation: "ordens_vistoria"
            referencedColumns: ["id"]
          },
        ]
      }
      transacoes_financeiras: {
        Row: {
          categoria: string | null
          cliente_id: string | null
          created_at: string
          data_pagamento: string | null
          data_vencimento: string | null
          descricao: string | null
          empresa_id: string
          id: string
          ordem_vistoria_id: string | null
          status: Database["public"]["Enums"]["status_transacao"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa_id: string
          id?: string
          ordem_vistoria_id?: string | null
          status?: Database["public"]["Enums"]["status_transacao"]
          tipo: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string | null
          cliente_id?: string | null
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          empresa_id?: string
          id?: string
          ordem_vistoria_id?: string | null
          status?: Database["public"]["Enums"]["status_transacao"]
          tipo?: Database["public"]["Enums"]["tipo_transacao"]
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_financeiras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_financeiras_ordem_vistoria_id_fkey"
            columns: ["ordem_vistoria_id"]
            isOneToOne: false
            referencedRelation: "ordens_vistoria"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          empresa_id: string | null
          id: string
          permissions: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          empresa_id?: string | null
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          empresa_id?: string | null
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          chassi: string | null
          cliente_id: string | null
          cor: string | null
          created_at: string
          empresa_id: string
          id: string
          marca: string | null
          modelo: string | null
          observacoes: string | null
          placa: string | null
          renavam: string | null
          updated_at: string
        }
        Insert: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          empresa_id: string
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string | null
          renavam?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number | null
          chassi?: string | null
          cliente_id?: string | null
          cor?: string | null
          created_at?: string
          empresa_id?: string
          id?: string
          marca?: string | null
          modelo?: string | null
          observacoes?: string | null
          placa?: string | null
          renavam?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          p_email: string
          p_nome: string
          p_password: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      admin_update_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_profile_id: string
        }
        Returns: undefined
      }
      create_auth_user: {
        Args: { p_email: string; p_password: string }
        Returns: string
      }
      get_current_empresa_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_super_master: { Args: never; Returns: boolean }
      register_empresa: { Args: { p_nome_empresa: string }; Returns: string }
      supermaster_create_empresa: {
        Args: {
          p_admin_email?: string
          p_admin_nome?: string
          p_admin_password?: string
          p_nome: string
        }
        Returns: string
      }
      supermaster_create_user: {
        Args: {
          p_email: string
          p_empresa_id: string
          p_nome: string
          p_password: string
          p_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: string
      }
      supermaster_delete_empresa: {
        Args: { p_empresa_id: string }
        Returns: undefined
      }
      supermaster_list_empresas: {
        Args: never
        Returns: {
          ativo: boolean
          cnpj: string | null
          created_at: string
          id: string
          nome: string
          plano: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "empresas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      supermaster_update_empresa: {
        Args: {
          p_ativo?: boolean
          p_empresa_id: string
          p_nome?: string
          p_plano?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      metodo_pagamento: "pix" | "cartao"
      status_pagamento: "pendente" | "pago" | "cancelado"
      status_transacao: "pendente" | "confirmada" | "cancelada"
      tipo_transacao: "receita" | "despesa"
      tipo_vistoria: "seguradora" | "detran" | "tecnica_engenharia"
      user_role: "super_admin" | "admin" | "gerente" | "funcionario"
      vistoria_status: "agendada" | "em_andamento" | "concluida" | "cancelada"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      metodo_pagamento: ["pix", "cartao"],
      status_pagamento: ["pendente", "pago", "cancelado"],
      status_transacao: ["pendente", "confirmada", "cancelada"],
      tipo_transacao: ["receita", "despesa"],
      tipo_vistoria: ["seguradora", "detran", "tecnica_engenharia"],
      user_role: ["super_admin", "admin", "gerente", "funcionario"],
      vistoria_status: ["agendada", "em_andamento", "concluida", "cancelada"],
    },
  },
} as const

