export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone_number: string | null
          full_name_ar: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          grade_level: 'grade_5' | 'grade_6' | 'grade_7' | null
          avatar_url: string | null
          email_verified: boolean | null
          phone_verified: boolean | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          phone_number?: string | null
          full_name_ar: string
          role: 'student' | 'parent' | 'teacher' | 'admin'
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7' | null
          avatar_url?: string | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone_number?: string | null
          full_name_ar?: string
          role?: 'student' | 'parent' | 'teacher' | 'admin'
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7' | null
          avatar_url?: string | null
          email_verified?: boolean | null
          phone_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name_ar: string
          name_en: string
          description_ar: string | null
          price_monthly: number | null
          price_quarterly: number | null
          price_yearly: number | null
          features: Json | null
          max_live_sessions: number | null
          can_download_videos: boolean | null
          can_download_materials: boolean | null
          priority_support: boolean | null
          is_active: boolean | null
          display_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name_ar: string
          name_en: string
          description_ar?: string | null
          price_monthly?: number | null
          price_quarterly?: number | null
          price_yearly?: number | null
          features?: Json | null
          max_live_sessions?: number | null
          can_download_videos?: boolean | null
          can_download_materials?: boolean | null
          priority_support?: boolean | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name_ar?: string
          name_en?: string
          description_ar?: string | null
          price_monthly?: number | null
          price_quarterly?: number | null
          price_yearly?: number | null
          features?: Json | null
          max_live_sessions?: number | null
          can_download_videos?: boolean | null
          can_download_materials?: boolean | null
          priority_support?: boolean | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          student_id: string
          plan_id: string
          period: 'monthly' | 'quarterly' | 'yearly'
          status: 'active' | 'expired' | 'cancelled' | null
          start_date: string
          end_date: string
          auto_renew: boolean | null
          activated_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          plan_id: string
          period: 'monthly' | 'quarterly' | 'yearly'
          status?: 'active' | 'expired' | 'cancelled' | null
          start_date: string
          end_date: string
          auto_renew?: boolean | null
          activated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          plan_id?: string
          period?: 'monthly' | 'quarterly' | 'yearly'
          status?: 'active' | 'expired' | 'cancelled' | null
          start_date?: string
          end_date?: string
          auto_renew?: boolean | null
          activated_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subjects: {
        Row: {
          id: string
          name_ar: string
          description_ar: string | null
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          icon_name: string | null
          color_code: string | null
          display_order: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name_ar: string
          description_ar?: string | null
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          icon_name?: string | null
          color_code?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name_ar?: string
          description_ar?: string | null
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7'
          icon_name?: string | null
          color_code?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      chapters: {
        Row: {
          id: string
          subject_id: string
          name_ar: string
          description_ar: string | null
          chapter_number: number
          display_order: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          subject_id: string
          name_ar: string
          description_ar?: string | null
          chapter_number: number
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          subject_id?: string
          name_ar?: string
          description_ar?: string | null
          chapter_number?: number
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      lessons: {
        Row: {
          id: string
          chapter_id: string
          name_ar: string
          description_ar: string | null
          lesson_number: number
          display_order: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          chapter_id: string
          name_ar: string
          description_ar?: string | null
          lesson_number: number
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          chapter_id?: string
          name_ar?: string
          description_ar?: string | null
          lesson_number?: number
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      live_sessions: {
        Row: {
          id: string
          title_ar: string
          description_ar: string | null
          subject_id: string | null
          chapter_id: string | null
          lesson_id: string | null
          teacher_id: string
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          scheduled_start: string
          scheduled_end: string
          actual_start: string | null
          actual_end: string | null
          status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | null
          meeting_platform: 'google_meet' | 'zoom'
          meeting_url: string
          meeting_id: string | null
          meeting_password: string | null
          max_participants: number | null
          required_plan_level: string | null
          reminder_sent: boolean | null
          recording_url: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_ar: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          teacher_id: string
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          scheduled_start: string
          scheduled_end: string
          actual_start?: string | null
          actual_end?: string | null
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | null
          meeting_platform: 'google_meet' | 'zoom'
          meeting_url: string
          meeting_id?: string | null
          meeting_password?: string | null
          max_participants?: number | null
          required_plan_level?: string | null
          reminder_sent?: boolean | null
          recording_url?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_ar?: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          teacher_id?: string
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7'
          scheduled_start?: string
          scheduled_end?: string
          actual_start?: string | null
          actual_end?: string | null
          status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | null
          meeting_platform?: 'google_meet' | 'zoom'
          meeting_url?: string
          meeting_id?: string | null
          meeting_password?: string | null
          max_participants?: number | null
          required_plan_level?: string | null
          reminder_sent?: boolean | null
          recording_url?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      recorded_sessions: {
        Row: {
          id: string
          title_ar: string
          description_ar: string | null
          subject_id: string | null
          chapter_id: string | null
          lesson_id: string | null
          teacher_id: string
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          video_url: string
          thumbnail_url: string | null
          duration_seconds: number | null
          file_size_mb: number | null
          recording_date: string | null
          required_plan_level: string | null
          view_count: number | null
          is_downloadable: boolean | null
          is_featured: boolean | null
          is_active: boolean | null
          uploaded_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_ar: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          teacher_id: string
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          video_url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          recording_date?: string | null
          required_plan_level?: string | null
          view_count?: number | null
          is_downloadable?: boolean | null
          is_featured?: boolean | null
          is_active?: boolean | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_ar?: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          teacher_id?: string
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7'
          video_url?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          file_size_mb?: number | null
          recording_date?: string | null
          required_plan_level?: string | null
          view_count?: number | null
          is_downloadable?: boolean | null
          is_featured?: boolean | null
          is_active?: boolean | null
          uploaded_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      assignments: {
        Row: {
          id: string
          title_ar: string
          description_ar: string | null
          subject_id: string | null
          chapter_id: string | null
          lesson_id: string | null
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          due_date: string
          total_points: number | null
          is_published: boolean | null
          required_plan_level: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_ar: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          grade_level: 'grade_5' | 'grade_6' | 'grade_7'
          due_date: string
          total_points?: number | null
          is_published?: boolean | null
          required_plan_level?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_ar?: string
          description_ar?: string | null
          subject_id?: string | null
          chapter_id?: string | null
          lesson_id?: string | null
          grade_level?: 'grade_5' | 'grade_6' | 'grade_7'
          due_date?: string
          total_points?: number | null
          is_published?: boolean | null
          required_plan_level?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      student_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          submission_text: string | null
          score: number | null
          feedback: string | null
          status: 'submitted' | 'graded' | 'late' | null
          submitted_at: string | null
          graded_at: string | null
          graded_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          submission_text?: string | null
          score?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded' | 'late' | null
          submitted_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          submission_text?: string | null
          score?: number | null
          feedback?: string | null
          status?: 'submitted' | 'graded' | 'late' | null
          submitted_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          created_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: 'session_reminder' | 'assignment_posted' | 'assignment_graded' | 'subscription_expiring' | 'subscription_expired' | 'message_received' | 'announcement' | 'other'
          channel: 'in_app' | 'email' | 'sms'
          title_ar: string
          message_ar: string
          action_url: string | null
          status: 'pending' | 'sent' | 'failed' | 'read' | null
          scheduled_for: string | null
          sent_at: string | null
          read_at: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: 'session_reminder' | 'assignment_posted' | 'assignment_graded' | 'subscription_expiring' | 'subscription_expired' | 'message_received' | 'announcement' | 'other'
          channel: 'in_app' | 'email' | 'sms'
          title_ar: string
          message_ar: string
          action_url?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'read' | null
          scheduled_for?: string | null
          sent_at?: string | null
          read_at?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: 'session_reminder' | 'assignment_posted' | 'assignment_graded' | 'subscription_expiring' | 'subscription_expired' | 'message_received' | 'announcement' | 'other'
          channel?: 'in_app' | 'email' | 'sms'
          title_ar?: string
          message_ar?: string
          action_url?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'read' | null
          scheduled_for?: string | null
          sent_at?: string | null
          read_at?: string | null
          metadata?: Json | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'student' | 'parent' | 'teacher' | 'admin'
      grade_level: 'grade_5' | 'grade_6' | 'grade_7'
      subscription_status: 'active' | 'expired' | 'cancelled'
      subscription_period: 'monthly' | 'quarterly' | 'yearly'
      session_status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
      meeting_platform: 'google_meet' | 'zoom'
      submission_status: 'submitted' | 'graded' | 'late'
      notification_type: 'session_reminder' | 'assignment_posted' | 'assignment_graded' | 'subscription_expiring' | 'subscription_expired' | 'message_received' | 'announcement' | 'other'
      notification_channel: 'in_app' | 'email' | 'sms'
      notification_status: 'pending' | 'sent' | 'failed' | 'read'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
