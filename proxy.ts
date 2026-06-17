import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/approve/(.*)',
  '/api/approve(.*)',
  '/api/webhooks/(.*)',
  '/api/extract-file(.*)',
  '/api/leads(.*)',
  '/api/cron/(.*)',
])

const isBillingRoute = createRouteMatcher([
  '/settings/billing(.*)',
  '/api/revolut/(.*)',
  '/api/admin/(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    const { userId } = await auth.protect()

    // Check trial expiry — skip for billing pages and API routes that handle payment
    if (userId && !isBillingRoute(request)) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('plan, trial_ends_at, payment_customer_id')
        .eq('id', userId)
        .single()

      if (user && user.plan === 'starter' && !user.payment_customer_id) {
        const trialExpired = user.trial_ends_at && new Date(user.trial_ends_at) < new Date()
        if (trialExpired) {
          const url = new URL('/settings/billing', request.url)
          url.searchParams.set('trial_expired', '1')
          return NextResponse.redirect(url)
        }
      }
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
