'use server'

import { createClient as createServerClient } from '../../utils/supabase/server'
import { createAdminClient } from '../../utils/supabase/admin'
import { generateInitials, formatLoginId, getNextSerial } from '../../utils/login-id'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

/**
 * Helper to generate a unique 3-letter (or more) company code from company name.
 * Checks for collisions in the database.
 */
async function generateUniqueCompanyCode(supabase, companyName) {
  // Extract alphanumeric characters, uppercase, and take first 3 characters
  let baseCode = companyName
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 3);
  
  if (baseCode.length < 3) {
    baseCode = baseCode.padEnd(3, 'X');
  }

  let code = baseCode;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('company_code', code)
      .maybeSingle();

    if (error) {
      throw new Error(`Error verifying company code: ${error.message}`);
    }

    if (!data) {
      isUnique = true;
    } else {
      code = `${baseCode}${counter}`;
      counter++;
    }
  }

  return code;
}

/**
 * Task 1.1: Company Sign-up action
 */
export async function onboardCompany(prevState, formData) {
  const companyName = formData.get('companyName');
  const adminName = formData.get('adminName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const logoFile = formData.get('logo'); // File object

  // Validations
  if (!companyName || !adminName || !email || !password) {
    return { error: 'Please fill in all required fields.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const supabaseServer = await createServerClient();

    // 1. Generate unique company code
    const companyCode = await generateUniqueCompanyCode(supabaseAdmin, companyName);

    // 2. Upload logo to storage if provided
    let logoUrl = null;
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${companyCode}-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const arrayBuffer = await logoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('logos')
        .upload(filePath, buffer, {
          contentType: logoFile.type,
          upsert: true,
        });

      if (uploadError) {
        return { error: `Logo upload failed: ${uploadError.message}` };
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('logos')
        .getPublicUrl(filePath);

      logoUrl = urlData.publicUrl;
    }

    // 3. Insert company record
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyName,
        company_code: companyCode,
        logo_url: logoUrl,
      })
      .select('id')
      .single();

    if (companyError) {
      return { error: `Failed to create company record: ${companyError.message}` };
    }

    const companyId = companyData.id;

    // 4. Sign up admin user in Supabase Auth
    // Note: This creates the auth user (verified-pending or pre-confirmed depending on Supabase configs)
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: adminName,
          role: 'admin',
          company_id: companyId,
        }
      }
    });

    if (authError) {
      // Cleanup company if auth fails
      await supabaseAdmin.from('companies').delete().eq('id', companyId);
      return { error: `Auth registration failed: ${authError.message}` };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { error: 'Registration failed. Verification email may have been sent.' };
    }

    // 5. Create admin profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.id,
        company_id: companyId,
        full_name: adminName,
        email,
        phone,
        role: 'admin',
        needs_password_change: false,
      });

    if (profileError) {
      // Cleanup auth user and company if profile fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      await supabaseAdmin.from('companies').delete().eq('id', companyId);
      return { error: `Failed to create admin profile: ${profileError.message}` };
    }

  } catch (error) {
    console.error('Onboarding exception:', error);
    return { error: error.message || 'An unexpected error occurred during onboarding.' };
  }

  // Redirect to success or sign in
  redirect('/signin?registered=true');
}

/**
 * Task 1.2: Sign-in action
 */
export async function signInUser(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  try {
    const supabase = await createServerClient();

    // Sign in using Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Generic non-revealing error message (Task 1.2 acceptance)
      return { error: 'Invalid login credentials. Please check your email and password.' };
    }

    const user = data.user;

    // Fetch the user profile to determine their role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, needs_password_change')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: 'User profile not found.' };
    }

    // Handle Forced Password Change redirect
    if (profile.role === 'employee' && profile.needs_password_change) {
      redirect('/set-password');
    }

    // Role-based redirect
    if (profile.role === 'admin') {
      redirect('/admin/dashboard');
    } else {
      redirect('/dashboard');
    }

  } catch (error) {
    // If it's a redirect, we must rethrow it as Next.js handles redirects via exceptions
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return { error: error.message || 'An unexpected error occurred during sign in.' };
  }
}

/**
 * Task 1.4: Admin-provisioned employee creation
 */
export async function provisionEmployee(prevState, formData) {
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');

  if (!fullName || !email) {
    return { error: 'Please fill in name and email.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const supabaseServer = await createServerClient();

    // 1. Get current logged-in admin's company info
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized.' };
    }

    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (adminProfileError || !adminProfile) {
      return { error: 'Failed to retrieve admin company context.' };
    }

    const companyId = adminProfile.company_id;

    // Retrieve company code
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('company_code')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      return { error: 'Failed to retrieve company details.' };
    }

    // 2. Generate sequential Login ID
    const currentYear = new Date().getFullYear();
    const initials = generateInitials(fullName);
    const nextSerial = await getNextSerial(supabaseAdmin, companyId, currentYear);
    const loginId = formatLoginId(company.company_code, initials, currentYear, nextSerial);

    // 3. Generate random temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase() + '!1';

    // 4. Create auth user in Supabase bypassing email confirmation using Admin API
    const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Pre-confirm the email address!
      user_metadata: {
        full_name: fullName,
        role: 'employee',
        company_id: companyId,
      }
    });

    if (authError) {
      return { error: `Auth provisioning failed: ${authError.message}` };
    }

    // 5. Create employee profile with needs_password_change = true
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newAuthUser.user.id,
        company_id: companyId,
        full_name: fullName,
        email,
        phone,
        role: 'employee',
        login_id: loginId,
        needs_password_change: true,
        joining_year: currentYear,
      });

    if (profileError) {
      // Cleanup provisioned user
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return { error: `Profile provisioning failed: ${profileError.message}` };
    }

    // Stub for emailing credentials: Log them for easy verification
    console.log(`[PROVISIONING EMAIL STUB] Sent to ${email}:`);
    console.log(`Login ID: ${loginId}`);
    console.log(`Temp Password: ${tempPassword}`);

    revalidatePath('/admin/dashboard');
    return { 
      success: true, 
      loginId, 
      tempPassword,
      message: `Employee successfully provisioned! Credentials logged server-side.` 
    };

  } catch (error) {
    console.error('Provisioning exception:', error);
    return { error: error.message || 'An unexpected error occurred during provisioning.' };
  }
}

/**
 * Task 1.4: First login force set password action
 */
export async function updateEmployeePassword(prevState, formData) {
  const newPassword = formData.get('newPassword');
  const confirmPassword = formData.get('confirmPassword');

  if (!newPassword || !confirmPassword) {
    return { error: 'Please fill in both password fields.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const supabase = await createServerClient();

    // 1. Update user password in auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      return { error: `Failed to update password: ${authError.message}` };
    }

    // 2. Clear needs_password_change flag in profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated.' };
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ needs_password_change: false })
      .eq('id', user.id);

    if (profileError) {
      return { error: `Failed to update profile flags: ${profileError.message}` };
    }

    revalidatePath('/dashboard');
  } catch (error) {
    return { error: error.message || 'An unexpected error occurred.' };
  }

  redirect('/dashboard');
}

/**
 * Sign-out action
 */
export async function signOutUser() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/signin');
}
