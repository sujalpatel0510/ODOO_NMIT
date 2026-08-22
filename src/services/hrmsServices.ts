"use client"

import { supabase } from "@/lib/auth"
import { AttendanceRecord, LeaveRequest, LeaveAllocation, PayrollRun, PayComponent, Employee } from "@/types"

// Attendance service
export const attendanceService = {
  // Check in for the day
  checkIn: async (profileId: string) => {
    const now = new Date()
    const checkInTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    
    const { error } = await supabase
      .from("attendance")
      .upsert({
        profile_id: profileId,
        check_in: checkInTime,
        date: now.toISOString().split("T")[0],
        status: "present",
      }, { onConflict: "profile_id,date" })
    
    if (error) throw error
    return { checkInTime, status: "present" }
  },

  // Check out for the day
  checkOut: async (profileId: string) => {
    const now = new Date()
    const checkOutTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const workHours = Math.round((now.getHours() * 60 + now.getMinutes() - 9 * 60) / 60 * 10) / 10
    
    const { error } = await supabase
      .from("attendance")
      .upsert({
        profile_id: profileId,
        check_out: checkOutTime,
        work_hours: workHours,
        extra_hours: Math.max(0, workHours - 8),
        status: "present",
      }, { onConflict: "profile_id,date" })
    
    if (error) throw error
    return { checkOutTime, workHours, extraHours: Math.max(0, workHours - 8) }
  },

  // Get today's attendance
  getTodayAttendance: async (profileId: string) => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("profile_id", profileId)
      .eq("date", new Date().toISOString().split("T")[0])
      .single()
    
    if (error) throw error
    return data
  },

  // Get attendance records list
  getAttendanceRecords: async (profileId: string, startDate?: string, endDate?: string) => {
    let query = supabase.from("attendance").select("*").eq("profile_id", profileId)
    
    if (startDate) {
      query = query.gte("date", startDate)
    }
    if (endDate) {
      query = query.lte("date", endDate)
    }
    
    const { data, error } = await query.order("date", { ascending: false })
    
    if (error) throw error
    return data
  },
}

// Leave service
export const leaveService = {
  // Request leave
  requestLeave: async (request: {
    profileId: string
    leaveType: "paid" | "sick" | "unpaid"
    startDate: string
    endDate: string
    reason: string
    attachmentUrl?: string
  }) => {
    const { error } = await supabase
      .from("leave_requests")
      .insert({
        profile_id: request.profileId,
        leave_type: request.leaveType,
        start_date: request.startDate,
        end_date: request.endDate,
        remarks: request.reason,
        attachment_url: request.attachmentUrl,
        status: "pending",
      })
    
    if (error) throw error
    return true
  },

  // Get leave requests
  getLeaveRequests: async (profileId: string, status?: string) => {
    let query = supabase.from("leave_requests").select("*").eq("profile_id", profileId)
    
    if (status) {
      query = query.eq("status", status)
    }
    
    const { data, error } = await query.order("start_date", { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get leave allocations
  getLeaveAllocations: async (profileId: string) => {
    const { data, error } = await supabase
      .from("leave_allocations")
      .select("*")
      .eq("profile_id", profileId)
    
    if (error) throw error
    return data
  },
}

// Payroll service
export const payrollService = {
  // Calculate payroll
  calculatePayroll: async (profileId: string, periodStart: string, periodEnd: string) => {
    // Get profile and salary structure
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()
    
    if (profileError) throw profileError
    
    const { data: salaryStruct, error: salaryError } = await supabase
      .from("salary_structures")
      .select("*")
      .eq("profile_id", profileId)
      .order("effective_date", { ascending: false })
      .limit(1)
    
    if (salaryError) throw salaryError
    
    // Get attendance for the period
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("profile_id", profileId)
      .gte("date", periodStart)
      .lte("date", periodEnd)
    
    if (attendanceError) throw attendanceError
    
    // Calculate working days (excluding weekends and unpaid leave)
    let workingDays = 0
    let presentDays = 0
    
    attendanceRecords?.forEach((record) => {
      const date = new Date(record.date)
      const day = date.getDay()
      
      // Skip weekends (Saturday=5, Sunday=6)
      if (day >= 0 && day <= 4) {
        workingDays++
        if (record.status === "present") {
          presentDays++
        }
      }
    })
    
    // Get salary components
    const monthlyWage = salaryStruct?.[0]?.monthly_wage || 0
    const components = salaryStruct?.[0]?.components || []
    
    // Calculate component amounts
    let totalComponents = 0
    components.forEach((comp: { type: string; amount: number | { value: number }; percent: number }) => {
      let amount = 0
      if (comp.type === "fixed") {
        amount = comp.amount
      } else if (comp.type === "percentage") {
        amount = Math.round((monthlyWage * comp.percent) / 100)
      }
      totalComponents += amount
    })
    
    // Calculate deductions
    const pfEmployee = salaryStruct?.[0]?.pf_employee_pct || 0
    const professionalTax = salaryStruct?.[0]?.professional_tax || 0
    const totalDeductions = Math.round((monthlyWage * pfEmployee) / 100) + professionalTax
    
    const netPay = totalComponents - totalDeductions
    
    // Create payroll run
    const { error } = await supabase
      .from("payroll_runs")
      .insert({
        profile_id: profileId,
        period_start: periodStart,
        period_end: periodEnd,
        payable_days: workingDays,
        computed_components: components,
        net_pay: netPay,
      })
    
    if (error) throw error
    
    return {
      grossPay: totalComponents,
      deductions: totalDeductions,
      netPay,
      workingDays,
      presentDays,
      components,
    }
  },
}

// Employee service
export const employeeService = {
  // Get employee profile
  getProfile: async (profileId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single()
    
    if (error) throw error
    return data
  },
  
  // Update profile
  updateProfile: async (profileId: string, updates: any) => {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profileId)
    
    if (error) throw error
    return true
  },
  
  // Get all employees for admin
  getAllEmployees: async (companyId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        companies!inner (name)
      `)
      .eq("company_id", companyId)
    
    if (error) throw error
    return data
  },
  
  // Get employees by department
  getEmployeesByDepartment: async (companyId: string, department: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", companyId)
      .eq("department", department)
    
    if (error) throw error
    return data
  },
}