import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { routePaths } from '../routes/routePaths'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] p-6">
      <div className="mx-auto max-w-xl">
        <Card className="p-6">
          <p className="text-lg font-semibold text-slate-900">Page not found</p>
          <p className="mt-1 text-sm text-slate-500">
            The page you’re looking for doesn’t exist.
          </p>
          <div className="mt-4">
            <Link
              to={routePaths.root}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Go to dashboard
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
