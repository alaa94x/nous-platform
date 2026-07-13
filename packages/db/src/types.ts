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
          name_ar: string | null
          name_tech: string | null
          name_tech_ar: string | null
          category: string | null
          tech_pills: string[] | null
          business_pills: string[] | null
          business_tags: string[] | null
          engineering_tags: string[] | null
          business_outcomes: string[] | null
          engineering_stack: string[] | null
          business_subtext: string | null
          business_subtext_ar: string | null
          sort_order: number
          active: boolean
        }
        Insert: {
          id?: string
          idx?: string | null
          name: string
          name_ar?: string | null
          name_tech?: string | null
          name_tech_ar?: string | null
          category?: string | null
          tech_pills?: string[] | null
          business_pills?: string[] | null
          business_tags?: string[] | null
          engineering_tags?: string[] | null
          business_outcomes?: string[] | null
          engineering_stack?: string[] | null
          business_subtext?: string | null
          business_subtext_ar?: string | null
          sort_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          idx?: string | null
          name?: string
          name_ar?: string | null
          name_tech?: string | null
          name_tech_ar?: string | null
          category?: string | null
          tech_pills?: string[] | null
          business_pills?: string[] | null
          business_tags?: string[] | null
          engineering_tags?: string[] | null
          business_outcomes?: string[] | null
          engineering_stack?: string[] | null
          business_subtext?: string | null
          business_subtext_ar?: string | null
          sort_order?: number
          active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          name_ar: string | null
          description: string | null
          description_ar: string | null
          year: string | null
          tags: string[] | null
          image_url: string | null
          url: string | null
          slug: string | null
          tagline: string | null
          tagline_ar: string | null
          overview: string | null
          overview_ar: string | null
          challenge: string | null
          challenge_ar: string | null
          solution: string | null
          solution_ar: string | null
          results: Json
          results_ar: Json
          tech: string[]
          services: string[]
          services_ar: string[]
          external_url: string | null
          is_case_study: boolean
          sort_order: number
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          year?: string | null
          tags?: string[] | null
          image_url?: string | null
          url?: string | null
          slug?: string | null
          tagline?: string | null
          tagline_ar?: string | null
          overview?: string | null
          overview_ar?: string | null
          challenge?: string | null
          challenge_ar?: string | null
          solution?: string | null
          solution_ar?: string | null
          results?: Json
          results_ar?: Json
          tech?: string[]
          services?: string[]
          services_ar?: string[]
          external_url?: string | null
          is_case_study?: boolean
          sort_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string | null
          description?: string | null
          description_ar?: string | null
          year?: string | null
          tags?: string[] | null
          image_url?: string | null
          url?: string | null
          slug?: string | null
          tagline?: string | null
          tagline_ar?: string | null
          overview?: string | null
          overview_ar?: string | null
          challenge?: string | null
          challenge_ar?: string | null
          solution?: string | null
          solution_ar?: string | null
          results?: Json
          results_ar?: Json
          tech?: string[]
          services?: string[]
          services_ar?: string[]
          external_url?: string | null
          is_case_study?: boolean
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
      testimonials: {
        Row: {
          id: string
          quote: string
          quote_ar: string | null
          author: string
          author_ar: string | null
          role: string | null
          role_ar: string | null
          initials: string | null
          sort_order: number
          active: boolean
        }
        Insert: {
          id?: string
          quote: string
          quote_ar?: string | null
          author: string
          author_ar?: string | null
          role?: string | null
          role_ar?: string | null
          initials?: string | null
          sort_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          quote?: string
          quote_ar?: string | null
          author?: string
          author_ar?: string | null
          role?: string | null
          role_ar?: string | null
          initials?: string | null
          sort_order?: number
          active?: boolean
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
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type DeviceType = 'mobile' | 'tablet' | 'desktop'
export type ContactStatus = Contact['status']
