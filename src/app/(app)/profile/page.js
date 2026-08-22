import { redirect } from 'next/navigation'
import { getCurrentSessionUser } from '../../../utils/session'

export default async function ProfileRedirect() {
  const session = await getCurrentSessionUser()
  if (!session) redirect('/signin')

  redirect(`/employees/${session.profile.id}`)
}
