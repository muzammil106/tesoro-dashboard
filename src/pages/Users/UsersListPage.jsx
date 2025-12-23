import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Pencil, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/useToast';
import { Table } from '../../components/tables/Table';
import { TableSkeleton } from '../../components/tables/TableSkeleton';
import { Avatar } from '../../components/ui/Avatar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useFileUploader } from '../../hooks/useFileUploader';

import { Pagination } from '../../components/tables/Pagination';
import {
  deleteUser,
  updateUser,
  createUser,
} from '../../api/services/userService';
import { getErrorMessage } from '../../utils/httpError';
import { getItems, getTotal } from '../../utils/paginated';
import { usePaginationSearchParams } from '../../hooks/usePaginationSearchParams';
import { useUserListQuery } from '../../hooks/useUserListQuery';

function cleanParam(value) {
  const v = String(value || '').trim();
  return v ? v : '';
}

export default memo(function UsersListPage() {
  const [sp, setSp] = useSearchParams();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { page, pageSize, setPage, setPageSize } = usePaginationSearchParams();

  const search = cleanParam(sp.get('search'));
  const isPremium = cleanParam(sp.get('isPremium')); // '', 'true', 'false'
  const [searchDraft, setSearchDraft] = useState(search);

  const setFilterParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(sp);
      const v = cleanParam(value);

      if (v) next.set(key, v);
      else next.delete(key);

      // reset pagination when filters change
      next.set('page', '1');
      next.set('pageSize', String(pageSize));
      setSp(next);
    },
    [pageSize, setSp, sp]
  );

  // Debounced search: typing triggers fetch.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchDraft.trim() === search) return;
      setFilterParam('search', searchDraft);
    }, 350);

    return () => window.clearTimeout(t);
  }, [search, searchDraft, setFilterParam]);

  const q = useUserListQuery({
    page,
    pageSize,
    search: search || undefined,
    isPremium: isPremium || undefined,
  });

  const rows = useMemo(() => getItems(q.data), [q.data]);
  const total = useMemo(() => getTotal(q.data), [q.data]);

  const onPageChange = useCallback((p) => setPage(p), [setPage]);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    isLoading: false,
    onConfirm: () => { },
  })

  const openConfirm = (opts) => setConfirmState({ ...opts, isOpen: true, isLoading: false })
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }))

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    profileImage: '',
    currentPassword: '',
    newPassword: '',
  })

  const { uploadFile, isUploading } = useFileUploader()
  const [preview, setPreview] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const url = await uploadFile(file)
      if (url) {
        setForm(prev => ({ ...prev, profileImage: url }))
      }
    } catch (err) {
      toast({ title: 'Upload failed', variant: 'error' })
    }
  }

  const removeImage = () => {
    setPreview(null)
    setForm(prev => ({ ...prev, profileImage: '' }))
  }

  const openEdit = useCallback((u) => {
    setEditing(u);
    setForm({
      name: u?.name || '',
      profileImage: u?.profileImage || u?.avatar || '',
      currentPassword: '',
      newPassword: '',
    });
    setModalOpen(true);
    setPreview(u?.profileImage || u?.avatar || null)
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setPreview(null)
    setEditing(null);
  }, []);

  const createM = useMutation({
    mutationFn: (payload) => createUser(payload),
    onSuccess: () => {
      toast({ title: 'User created', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err) =>
      toast({
        title: 'Creation failed',
        description: getErrorMessage(err),
        variant: 'error',
      }),
  });

  const updateM = useMutation({
    mutationFn: (payload) => updateUser(payload),
    onSuccess: () => {
      toast({ title: 'User updated', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['users'] });
      closeModal();
    },
    onError: (err) =>
      toast({
        title: 'Update failed',
        description: getErrorMessage(err),
        variant: 'error',
      }),
  });

  const blockM = useMutation({
    mutationFn: ({ userId, nextBlocked }) =>
      updateUser({ userId, isBlocked: nextBlocked }),
    onMutate: async ({ userId, nextBlocked }) => {
      await qc.cancelQueries({ queryKey: ['users'] });
      const prev = qc.getQueryData([
        'users',
        {
          page,
          pageSize,
          search: search || undefined,
          isPremium: isPremium || undefined,
        },
      ]);

      qc.setQueryData(
        [
          'users',
          {
            page,
            pageSize,
            search: search || undefined,
            isPremium: isPremium || undefined,
          },
        ],
        (old) => {
          const items = getItems(old);
          const nextItems = items.map((u) => {
            const id = u?._id || u?.id;
            if (String(id) !== String(userId)) return u;
            return { ...u, isBlocked: nextBlocked };
          });
          return { ...(old || {}), items: nextItems };
        }
      );

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(
          [
            'users',
            {
              page,
              pageSize,
              search: search || undefined,
              isPremium: isPremium || undefined,
            },
          ],
          ctx.prev
        );
      }
      toast({
        title: 'Block update failed',
        description: getErrorMessage(err),
        variant: 'error',
      });
    },
    onSuccess: () => {
      toast({ title: 'User updated', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteM = useMutation({
    mutationFn: ({ userId, password }) => deleteUser({ userId, password }),
    onSuccess: () => {
      toast({ title: 'User deleted', variant: 'success' });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) =>
      toast({
        title: 'Delete failed',
        description: getErrorMessage(err),
        variant: 'error',
      }),
  });

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const userId = editing?._id || editing?.id;

      if (!userId) {
        // Create mode
        createM.mutate({
          name: form.name,
          email: form.email,
          password: form.newPassword,
          role: 'USER', // default role
        });
        return;
      }

      // Update mode
      updateM.mutate({
        userId,
        name: form.name,
        profileImage: form.profileImage,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      });
    },
    [editing, form, updateM, createM]
  );

  const columns = useMemo(() => {
    const getBool = (v) => Boolean(v);

    const Toggle = ({ on, disabled, onToggle, title }) => (
      <button
        type="button"
        className={
          'relative inline-flex h-6 w-10 items-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-sky-300 ' +
          (disabled ? 'opacity-50' : '') +
          ' ' +
          (on
            ? 'border-slate-900 bg-slate-900'
            : 'border-slate-300 bg-slate-200')
        }
        aria-label={title || (on ? 'On' : 'Off')}
        title={title}
        role="switch"
        aria-checked={on}
        disabled={disabled}
        onClick={onToggle}
      >
        <span
          className={
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition ' +
            (on ? 'translate-x-4' : 'translate-x-0.5')
          }
        />
      </button>
    );

    return [
      {
        key: 'name',
        header: 'Name',
        cell: (r) => (
          <div className="flex items-center gap-3">
            <Avatar src={r.profileImage || r.avatar} alt={r.name} size="sm" />
            <div className="font-medium text-slate-900">{r.name || r.username || '—'}</div>
          </div>
        )
      },
      { key: 'email', header: 'Email', cell: (r) => r.email || '—' },
      {
        key: 'premium',
        header: 'Premium',
        cell: (r) => (r.isPremium ? 'Yes' : 'No'),
      },
      {
        key: 'deleted',
        header: 'Deleted',
        cell: (r) => {
          const userId = r?._id || r?.id;
          const on = getBool(r.isDeleted ?? r.isDelete ?? r.deleted);

          return (
            <Toggle
              on={on}
              disabled={updateM.isPending || !userId}
              title={on ? 'Restore user' : 'Delete user'}
              onToggle={() => {
                if (!userId) return

                openConfirm({
                  title: on ? 'Restore User?' : 'Delete User?',
                  description: on
                    ? `Are you sure you want to restore "${r.name || r.email}"?`
                    : `Are you sure you want to delete "${r.name || r.email}"? This action can be undone later.`,
                  confirmLabel: on ? 'Restore' : 'Delete',
                  variant: on ? 'primary' : 'danger',
                  onConfirm: () => updateM.mutate({ userId, isDeleted: !on })
                })
              }}
            />
          );
        },
      },
      {
        key: 'blocked',
        header: 'Blocked',
        cell: (r) => {
          const userId = r?._id || r?.id;
          const on = getBool(r.isBlocked ?? r.isBlock ?? r.blocked);
          const nextBlocked = !on;

          return (
            <Toggle
              on={on}
              disabled={updateM.isPending || !userId}
              title={on ? 'Unblock user' : 'Block user'}
              onToggle={() => {
                if (!userId) return

                openConfirm({
                  title: on ? 'Unblock User?' : 'Block User?',
                  description: on
                    ? `Are you sure you want to unblock "${r.name || r.email}"?`
                    : `Are you sure you want to block "${r.name || r.email}"? They will assume restricted access.`,
                  confirmLabel: on ? 'Unblock' : 'Block',
                  variant: on ? 'primary' : 'danger',
                  onConfirm: () => updateM.mutate({ userId, isBlocked: nextBlocked })
                })
              }}
            />
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        cell: (r) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEdit(r)}
            aria-label="Edit user"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ];
  }, [blockM, deleteM, openEdit]);

  const onClearSearch = useCallback(() => {
    setSearchDraft('');
    setFilterParam('search', '');
  }, [setFilterParam]);

  if (q.isLoading && !q.data) return <TableSkeleton cols={6} />;

  if (q.isError) {
    return (
      <EmptyState
        title="Failed to load users"
        description={getErrorMessage(q.error)}
        action={<Button onClick={() => q.refetch()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Management"
        right={
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditing(null);
                setForm({ name: '', email: '', newPassword: '', role: 'USER' });
                setModalOpen(true);
              }}
            >
              Add User
            </Button>
          </div>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="mb-1 text-xs font-medium text-slate-600">
              Search (name or email)
            </p>
            <div className="flex gap-2">
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="john@example.com"
              />
              <Button
                variant="ghost"
                onClick={onClearSearch}
                disabled={!search}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="mb-1 text-xs font-medium text-slate-600">Premium</p>
            <Select
              value={isPremium}
              onChange={(val) => setFilterParam('isPremium', val)}
            >
              <option value="">All</option>
              <option value="true">Premium</option>
              <option value="false">Non-premium</option>
            </Select>
          </div>

          <div className="md:col-span-3">
            <p className="mb-1 text-xs font-medium text-slate-600">Rows</p>
            <Select
              value={String(pageSize)}
              onChange={(val) => setPageSize(Number(val))}
            >
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>
      </Card>

      {rows.length ? (
        <Table columns={columns} rows={rows} rowKey={(r) => r._id || r.id} />
      ) : (
        <EmptyState title="No users" description="No data returned." />
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-slate-950/40 p-4">
          <div className="w-full max-w-xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    {editing ? 'Edit user' : 'Add user'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {editing
                      ? 'Update name / profile image (password change optional).'
                      : 'Create a new user with email and password.'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  Close
                </Button>
              </div>

              <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={onSubmit}>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    Profile image
                  </p>

                  <div className="flex items-center gap-4">
                    <Avatar src={preview || form.profileImage} size="lg" />

                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <Button type="button" variant="outline" size="sm" isLoading={isUploading}>
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                        </Button>
                      </div>

                      {(preview || form.profileImage) && (
                        <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="text-red-500 hover:text-red-600">
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-slate-600">
                    Name
                  </p>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>



                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {!editing && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-600">
                        Email
                      </p>
                      <Input
                        value={form.email || ''}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>
                  )}

                  {editing && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-slate-600">
                        Current password (optional)
                      </p>
                      <Input
                        value={form.currentPassword}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            currentPassword: e.target.value,
                          }))
                        }
                        type="password"
                      />
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-600">
                      {editing ? 'New password (optional)' : 'Password'}
                    </p>
                    <Input
                      value={form.newPassword}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" type="button" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={updateM.isPending || createM.isPending}
                    disabled={updateM.isPending || createM.isPending}
                  >
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        isLoading={updateM.isPending}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
});
