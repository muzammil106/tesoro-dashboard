import { memo, useCallback, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../api/services/authService'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/useToast'
import { clearAuthToken, setAuthName, setAuthRole, setAuthToken } from '../../utils/authToken'
import { routePaths } from '../../routes/routePaths'
import { getErrorMessage } from '../../utils/httpError'

const DEFAULT_REDIRECT = routePaths.root

function pickToken(data) {
  return (
    data?.token ||
    data?.accessToken ||
    data?.access_token ||
    data?.data?.token ||
    data?.data?.accessToken ||
    ''
  )
}

function pickRole(data) {
  return data?.role || data?.user?.role || data?.data?.role || data?.data?.user?.role || ''
}

function pickName(data) {
  return data?.name || data?.user?.name || data?.data?.name || data?.data?.user?.name || ''
}

export default memo(function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const from = location.state?.from || DEFAULT_REDIRECT

  const m = useMutation({
    mutationFn: (payload) => login(payload),
    onSuccess: (data) => {
      const token = pickToken(data)
      const role = String(pickRole(data)).toLowerCase()

      if (!token) {
        toast({
          title: 'Login failed',
          description: 'No token returned by server.',
          variant: 'error',
        })
        return
      }

      if (role !== 'admin') {
        clearAuthToken()
        toast({
          title: 'Access denied',
          description: 'Only admins can access this portal.',
          variant: 'error',
        })
        return
      }

      setAuthToken(token)
      setAuthRole(role)
      const name = pickName(data)
      if (name) setAuthName(name)
      navigate(from, { replace: true })
    },
    onError: (err) => {
      toast({
        title: 'Login failed',
        description: getErrorMessage(err),
        variant: 'error',
      })
    },
  })

  useEffect(() => {
    const error = location.state?.error
    if (!error) return

    toast({ title: 'Access denied', description: String(error), variant: 'error' })
    navigate(routePaths.login, { replace: true, state: { from } })
  }, [from, location.state, navigate, toast])

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      if (!email || !password || m.isPending) return
      m.mutate({ email, password })
    },
    [email, password, m],
  )

  return (
    <Card className="w-full p-6">
      <p className="text-lg font-semibold text-slate-900">Admin sign in</p>
      <p className="mt-1 text-sm text-slate-500">
        Sign in with your account. Only admins can access this portal.
      </p>

      <form className="mt-5 space-y-3" onSubmit={onSubmit}>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">Email</p>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            type="email"
            autoComplete="email"
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">Password</p>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!email || !password}
          isLoading={m.isPending}
        >
          Sign in
        </Button>
      </form>
    </Card>
  )
})
