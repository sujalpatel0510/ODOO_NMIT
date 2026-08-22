import { createClient } from '../../../utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfileRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/signin')

  redirect(`/employees/${user.id}`)
}
