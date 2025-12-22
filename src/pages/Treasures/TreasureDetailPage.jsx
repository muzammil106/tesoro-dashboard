import { memo, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/loaders/Skeleton';
import { getErrorMessage } from '../../utils/httpError';
import { getTreasureDetail } from '../../api/services/treasureService';

function cleanUrl(u) {
  const v = String(u || '').trim();
  return v || '';
}

export default memo(function TreasureDetailPage() {
  const { id } = useParams();

  const q = useQuery({
    queryKey: ['treasure', id],
    queryFn: () => getTreasureDetail(id),
    enabled: Boolean(id),
  });

  const t = q.data || {};
  const pretty = useMemo(() => JSON.stringify(q.data || {}, null, 2), [q.data]);

  const photos = useMemo(() => {
    const list = Array.isArray(q.data?.photos) ? q.data.photos : [];
    return list.map(cleanUrl).filter(Boolean);
  }, [q.data?.photos]);

  if (q.isLoading) return <Skeleton className="h-72" />;

  if (q.isError) {
    return (
      <EmptyState
        title="Failed to load treasure"
        description={getErrorMessage(q.error)}
        action={<Button onClick={() => q.refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={t.title || 'Treasure'}
        subtitle={t._id || id}
        right={
          <Button variant="ghost" onClick={() => q.refetch()}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <p className="text-sm font-semibold text-slate-900">Overview</p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.price ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Condition</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.condition || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Category</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.category || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Type</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.type || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Brand</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.brand || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Model</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.itemModel || '—'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500">Description</p>
            <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">
              {t.description || '—'}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-slate-900">
            People & Location
          </p>

          <div className="mt-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Posted by</p>
              <p className="text-sm font-semibold text-slate-900">
                {t.postedBy?.name || '—'}
              </p>
              <p className="text-xs text-slate-500">
                Rating: {t.postedBy?.rating ?? '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Address</p>
              <p className="text-sm text-slate-900">
                {t.location?.address || '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Coordinates</p>
              <p className="text-sm text-slate-900">
                {Array.isArray(t.location?.coordinates)
                  ? `${t.location.coordinates[1]}, ${t.location.coordinates[0]}`
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Created</p>
              <p className="text-sm text-slate-900">{t.createdAt || '—'}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500">Updated</p>
              <p className="text-sm text-slate-900">{t.updatedAt || '—'}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-sm font-semibold text-slate-900">Photos</p>

        {photos.length ? (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={src}
                  alt="Treasure"
                  className="h-40 w-full rounded-xl border border-slate-200 object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No photos.</p>
        )}
      </Card>
    </div>
  );
});
