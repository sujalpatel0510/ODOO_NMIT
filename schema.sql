-- ==============================================================================
-- Dayflow HRMS - Complete Database Schema & RLS Policies
-- Design System & Data Model for All Features
-- Idempotent script: Safe to execute multiple times in Supabase SQL Editor
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. COMPANIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company_code TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to companies" ON public.companies;
CREATE POLICY "Allow public read access to companies" 
    ON public.companies FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Allow service_role full control on companies" ON public.companies;
CREATE POLICY "Allow service_role full control on companies" 
    ON public.companies FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admins to update their company" ON public.companies;
CREATE POLICY "Allow admins to update their company" 
    ON public.companies FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = companies.id
        )
    );

-- ==============================================================================
-- 2. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    login_id TEXT UNIQUE,
    employee_id TEXT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
    phone TEXT,
    address TEXT,
    profile_picture_url TEXT,
    job_title TEXT DEFAULT 'Team Member',
    department TEXT DEFAULT 'General',
    date_joined DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
    nationality TEXT,
    gender TEXT,
    marital_status TEXT,
    personal_email TEXT,
    bank_details JSONB DEFAULT '{}'::jsonb,
    pan_no TEXT,
    pf_no TEXT,
    aadhar_no TEXT,
    needs_password_change BOOLEAN DEFAULT false NOT NULL,
    joining_year INTEGER DEFAULT extract(year from now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read profiles within their company" ON public.profiles;
CREATE POLICY "Allow users to read profiles within their company" 
    ON public.profiles FOR SELECT 
    USING (
        company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
        OR id = auth.uid()
    );

DROP POLICY IF EXISTS "Allow users to update own profile limited fields" ON public.profiles;
CREATE POLICY "Allow users to update own profile limited fields" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admins full update on company profiles" ON public.profiles;
CREATE POLICY "Allow admins full update on company profiles" 
    ON public.profiles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = profiles.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on profiles" ON public.profiles;
CREATE POLICY "Allow service_role full control on profiles" 
    ON public.profiles FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 3. RESUME_ENTRIES TABLE (Profile Sub-entity)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resume_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    about TEXT,
    job_love_note TEXT,
    hobbies_note TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resume_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read resume in same company" ON public.resume_entries;
CREATE POLICY "Allow users to read resume in same company" 
    ON public.resume_entries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            JOIN public.profiles my_p ON my_p.id = auth.uid()
            WHERE p.id = resume_entries.profile_id
            AND p.company_id = my_p.company_id
        )
    );

DROP POLICY IF EXISTS "Allow users to update own resume" ON public.resume_entries;
CREATE POLICY "Allow users to update own resume" 
    ON public.resume_entries FOR ALL 
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow service_role full control on resume_entries" ON public.resume_entries;
CREATE POLICY "Allow service_role full control on resume_entries" 
    ON public.resume_entries FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 4. SALARY_STRUCTURES TABLE (Admin-write, Employee-read-own)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.salary_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    monthly_wage NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    yearly_wage NUMERIC(14,2) DEFAULT 0.00 NOT NULL,
    working_days_per_week INTEGER DEFAULT 5 NOT NULL,
    break_time_minutes INTEGER DEFAULT 60 NOT NULL,
    components JSONB DEFAULT '[]'::jsonb NOT NULL,
    pf_employer_pct NUMERIC(5,2) DEFAULT 12.00 NOT NULL,
    pf_employee_pct NUMERIC(5,2) DEFAULT 12.00 NOT NULL,
    professional_tax NUMERIC(10,2) DEFAULT 200.00 NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    effective_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow employees to view own salary structure" ON public.salary_structures;
CREATE POLICY "Allow employees to view own salary structure" 
    ON public.salary_structures FOR SELECT 
    USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Allow admins to view all salary structures in company" ON public.salary_structures;
CREATE POLICY "Allow admins to view all salary structures in company" 
    ON public.salary_structures FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            JOIN public.profiles target_p ON target_p.id = salary_structures.profile_id
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = target_p.company_id
        )
    );

DROP POLICY IF EXISTS "Allow admins to insert/update salary structures in company" ON public.salary_structures;
CREATE POLICY "Allow admins to insert/update salary structures in company" 
    ON public.salary_structures FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            JOIN public.profiles target_p ON target_p.id = salary_structures.profile_id
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = target_p.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            JOIN public.profiles target_p ON target_p.id = salary_structures.profile_id
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = target_p.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on salary_structures" ON public.salary_structures;
CREATE POLICY "Allow service_role full control on salary_structures" 
    ON public.salary_structures FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 5. ATTENDANCE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    work_hours NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    extra_hours NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    break_minutes INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half-day', 'leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own attendance or admin to view company attendance" ON public.attendance;
CREATE POLICY "Allow users to view own attendance or admin to view company attendance" 
    ON public.attendance FOR SELECT 
    USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = attendance.company_id
        )
    );

DROP POLICY IF EXISTS "Allow users to check in and check out for themselves" ON public.attendance;
CREATE POLICY "Allow users to check in and check out for themselves" 
    ON public.attendance FOR ALL 
    USING (profile_id = auth.uid())
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins full control on company attendance" ON public.attendance;
CREATE POLICY "Allow admins full control on company attendance" 
    ON public.attendance FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = attendance.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on attendance" ON public.attendance;
CREATE POLICY "Allow service_role full control on attendance" 
    ON public.attendance FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 6. LEAVE_ALLOCATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leave_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    allocated_days NUMERIC(4,1) DEFAULT 0.0 NOT NULL,
    remaining_days NUMERIC(4,1) DEFAULT 0.0 NOT NULL,
    year INTEGER DEFAULT extract(year from now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, leave_type, year)
);

ALTER TABLE public.leave_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own allocations or admin view company" ON public.leave_allocations;
CREATE POLICY "Allow users to view own allocations or admin view company" 
    ON public.leave_allocations FOR SELECT 
    USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = leave_allocations.company_id
        )
    );

DROP POLICY IF EXISTS "Allow admins to manage allocations in company" ON public.leave_allocations;
CREATE POLICY "Allow admins to manage allocations in company" 
    ON public.leave_allocations FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = leave_allocations.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on leave_allocations" ON public.leave_allocations;
CREATE POLICY "Allow service_role full control on leave_allocations" 
    ON public.leave_allocations FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 7. LEAVE_REQUESTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    remarks TEXT,
    attachment_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_comment TEXT,
    decided_by UUID REFERENCES public.profiles(id),
    decided_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own requests or admin view company" ON public.leave_requests;
CREATE POLICY "Allow users to view own requests or admin view company" 
    ON public.leave_requests FOR SELECT 
    USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = leave_requests.company_id
        )
    );

DROP POLICY IF EXISTS "Allow users to create their own leave requests" ON public.leave_requests;
CREATE POLICY "Allow users to create their own leave requests" 
    ON public.leave_requests FOR INSERT 
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins to update leave requests" ON public.leave_requests;
CREATE POLICY "Allow admins to update leave requests" 
    ON public.leave_requests FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = leave_requests.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on leave_requests" ON public.leave_requests;
CREATE POLICY "Allow service_role full control on leave_requests" 
    ON public.leave_requests FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 8. PAYROLL_RUNS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payroll_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    payable_days NUMERIC(4,1) DEFAULT 30.0 NOT NULL,
    total_days INTEGER DEFAULT 30 NOT NULL,
    computed_components JSONB DEFAULT '{}'::jsonb NOT NULL,
    gross_pay NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    total_deductions NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    net_pay NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status TEXT DEFAULT 'processed' CHECK (status IN ('draft', 'processed', 'paid')),
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow employees to view own payroll runs" ON public.payroll_runs;
CREATE POLICY "Allow employees to view own payroll runs" 
    ON public.payroll_runs FOR SELECT 
    USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Allow admins to view all company payroll runs" ON public.payroll_runs;
CREATE POLICY "Allow admins to view all company payroll runs" 
    ON public.payroll_runs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = payroll_runs.company_id
        )
    );

DROP POLICY IF EXISTS "Allow admins to insert and update payroll runs" ON public.payroll_runs;
CREATE POLICY "Allow admins to insert and update payroll runs" 
    ON public.payroll_runs FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin' 
            AND p.company_id = payroll_runs.company_id
        )
    );

DROP POLICY IF EXISTS "Allow service_role full control on payroll_runs" ON public.payroll_runs;
CREATE POLICY "Allow service_role full control on payroll_runs" 
    ON public.payroll_runs FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- ==============================================================================
-- 9. STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('logos', 'logos', true),
    ('attachments', 'attachments', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Allow public read access to storage buckets" ON storage.objects;
CREATE POLICY "Allow public read access to storage buckets" 
    ON storage.objects FOR SELECT 
    USING (bucket_id IN ('logos', 'attachments', 'avatars'));

DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload files" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id IN ('logos', 'attachments', 'avatars') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow service_role full control on storage objects" ON storage.objects;
CREATE POLICY "Allow service_role full control on storage objects" 
    ON storage.objects FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);
