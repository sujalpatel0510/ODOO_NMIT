import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
  const url = new URL(request.nextUrl.clone())
  
  // 1. Initialize Supabase server client for middleware
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Retrieve session user
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = url.pathname === '/signin' || url.pathname === '/signup' || url.pathname === '/'
  const isAdminRoute = url.pathname.startsWith('/admin')
  const isDashboardRoute = url.pathname.startsWith('/dashboard')
  const isSetPasswordRoute = url.pathname === '/set-password'

  // If user is authenticated, retrieve profile role and password status
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, needs_password_change')
      .eq('id', user.id)
      .maybeSingle()
    
    profile = data
  }

  // Guard redirects
  if (user && profile) {
    // If authenticated and tries to visit sign-in/sign-up/landing pages, redirect to dashboard
    if (isAuthRoute) {
      if (profile.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        if (profile.needs_password_change) {
          return NextResponse.redirect(new URL('/set-password', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Protect admin routes
    if (isAdminRoute && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Protect employee dashboard routes
    if (isDashboardRoute) {
      if (profile.needs_password_change) {
        return NextResponse.redirect(new URL('/set-password', request.url))
      }
      if (profile.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
    }

    // Protect set-password page
    if (isSetPasswordRoute) {
      if (!profile.needs_password_change) {
        return NextResponse.redirect(
          new URL(profile.role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url)
        )
      }
    }
  } else {
    // If not authenticated and trying to access protected routes, redirect to signin
    if (isAdminRoute || isDashboardRoute || isSetPasswordRoute) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - company-logos/ (logos in storage)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
