export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
          key: string
          value: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string | null
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          idx: string | null
          name: string
          category: string | null
          tech_pills: string[] | null
          sort_order: number
          active: boolean
        }
        Insert: {
          id?: string
          idx?: string | null
          name: string
          category?: string | null
          tech_pills?: string[] | null
          sort_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          idx?: string | null
          name?: string
          category?: string | null
          tech_pills?: string[] | null
          sort_order?: number
          active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          year: string | null
          tags: string[] | null
          image_url: string | null
          sort_order: number
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          year?: string | null
          tags?: string[] | null
          image_url?: string | null
          sort_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          year?: string | null
          tags?: string[] | null
          image_url?: string | null
          sort_order?: number
          active?: boolean
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          services: string[] | null
          message: string | null
          status: 'new' | 'in_review' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          services?: string[] | null
          message?: string | null
          status?: 'new' | 'in_review' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          services?: string[] | null
          message?: string | null
          status?: 'new' | 'in_review' | 'closed'
          created_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event: string
          path: string | null
          metadata: Json | null
          session_id: string | null
          country: string | null
          referrer: string | null
          device: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event: string
          path?: string | null
          metadata?: Json | null
          session_id?: string | null
          country?: string | null
          referrer?: string | null
          device?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event?: string
          path?: string | null
          metadata?: Json | null
          session_id?: string | null
          country?: string | null
          referrer?: string | null
          device?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Convenience row types
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type ContactStatus = Contact['status']
