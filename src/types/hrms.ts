export interface AttendanceRecord {
  id: string
  profile_id: string
  date: string
  check_in: string | null
  check_out: string | null
  work_hours: number
  extra_hours: number
  status: "present" | "absent" | "half-day" | "leave"
}

export interface LeaveAllocation {
  id: string
  profile_id: string
  leave_type: "paid" | "sick" | "unpaid"
  allocated_days: number
  remaining_days: number
}

export interface LeaveRequest {
  id: string
  profile_id: string
  leave_type: "paid" | "sick" | "unpaid"
  start_date: string
  end_date: string
  duration: number
  reason: string
  status: "pending" | "approved" | "rejected"
  admin_comment?: string
  decided_by?: string
  decided_at?: string
  attachment_url?: string
}

export interface PayrollRun {
  id: string
  profile_id: string
  period_start: string
  period_end: string
  payable_days: number
  computed_components: any
  net_pay: number
  updated_by: string
  created_at: string
}

export interface PayComponent {
  name: string
  type: "amount" | "percentage"
  value: number
  label: string
}

export interface SalaryStructure {
  id: string
  profile_id: string
  monthly_wage: number
  yearly_wage: number
  working_days_per_week: number
  break_time_minutes: number
  components: {
    basic: { amount: number; percent: number }
    hra: { amount: number; percent: number }
    bonus: { amount: number; percent: number }
    lta: { amount: number; percent: number }
    fixed: { amount: number; percent: number }
  }[]
  pf_employer_pct: number
  pf_employee_pct: number
  professional_tax: number
  updated_by: string
  effective_date: string
}

export interface Employee {
  id: string
  company_id: string
  login_id: string
  employee_id: string
  full_name: string
  email: string
  role: "admin" | "employee"
  phone: string
  address: string
  profile_picture_url?: string
  job_title: string
  department: string
  date_joined: string
  status: "active" | "inactive" | "on-leave"
  nationality: string
  gender: string
  marital_status: string
  personal_email?: string
  bank_details?: any
  pan_no?: string
  pf_no?: string
  aadhar_no?: string
}

export interface User {
  id: string
  email: string | null
  user_metadata?: any
  app_metadata?: any
  role?: "admin" | "employee"
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  search?: string
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}