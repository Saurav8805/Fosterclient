export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          mobile: string
          password_hash: string
          role: number
          full_name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mobile: string
          password_hash: string
          role: number
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mobile?: string
          password_hash?: string
          role?: number
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          teacher_id: string | null
          class: string | null
          section: string | null
          roll_no: string | null
          dob: string | null
          blood_group: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          emergency_contact: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          teacher_id?: string | null
          class?: string | null
          section?: string | null
          roll_no?: string | null
          dob?: string | null
          blood_group?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          emergency_contact?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          teacher_id?: string | null
          class?: string | null
          section?: string | null
          roll_no?: string | null
          dob?: string | null
          blood_group?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          emergency_contact?: string | null
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          user_id: string
          designation: string | null
          department: string | null
          joining_date: string | null
          salary: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          designation?: string | null
          department?: string | null
          joining_date?: string | null
          salary?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          designation?: string | null
          department?: string | null
          joining_date?: string | null
          salary?: number | null
          created_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          user_id: string
          date: string
          status: string
          subject: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          status: string
          subject?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          status?: string
          subject?: string | null
          created_at?: string
        }
      }
      fees: {
        Row: {
          id: string
          student_id: string
          total_fees: number
          paid_amount: number
          pending_amount: number
          due_date: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          total_fees: number
          paid_amount?: number
          pending_amount?: number
          due_date?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          total_fees?: number
          paid_amount?: number
          pending_amount?: number
          due_date?: string | null
          status?: string
          created_at?: string
        }
      }
      homework: {
        Row: {
          id: string
          class: string
          subject: string
          description: string
          due_date: string
          assigned_by: string
          created_at: string
        }
        Insert: {
          id?: string
          class: string
          subject: string
          description: string
          due_date: string
          assigned_by: string
          created_at?: string
        }
        Update: {
          id?: string
          class?: string
          subject?: string
          description?: string
          due_date?: string
          assigned_by?: string
          created_at?: string
        }
      }
      behaviour: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          rating: number
          comment: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          rating: number
          comment: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          rating?: number
          comment?: string
          date?: string
          created_at?: string
        }
      }
      progress: {
        Row: {
          id: string
          student_id: string
          subject: string
          marks: number
          total_marks: number
          grade: string
          percentage: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          subject: string
          marks: number
          total_marks: number
          grade: string
          percentage: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          subject?: string
          marks?: number
          total_marks?: number
          grade?: string
          percentage?: number
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          date: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          date: string
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          date?: string
          type?: string
          created_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string
          image_url: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          title: string
          image_url: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          title?: string
          image_url?: string
          uploaded_at?: string
        }
      }
    }
  }
}
