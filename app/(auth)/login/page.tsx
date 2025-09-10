import { redirect } from 'next/navigation'

export default function LoginRedirect({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const raw = searchParams?.callbackUrl || ''
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {}

  const qs = raw ? `?callbackUrl=${encodeURIComponent(raw)}` : ''

  // Tentukan tujuan login berdasarkan callbackUrl
  if (decoded.includes('/dashboard/orangtua')) redirect(`/login/orangtua${qs}`)
  // default ke login ustadz
  redirect(`/login/ustadz${qs}`)
}
