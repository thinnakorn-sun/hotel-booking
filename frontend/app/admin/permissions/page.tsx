'use client';

import { Shield, UserPlus, Pencil, UserX, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  createAdminUser,
  fetchAdminUsers,
  patchAdminUser,
} from '@/lib/api/users';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import { MotionButton } from '@/components/ui/motion-button';
import { MotionModal } from '@/components/ui/motion-modal';
import type { StaffUserDto } from '@/lib/types/staff-user';

const ROLES = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
] as const;

const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

export default function PermissionsPage() {
  const { confirm: confirmDialog } = useAppDialog();
  const [users, setUsers] = useState<StaffUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editUser, setEditUser] = useState<StaffUserDto | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<string>('STAFF');
  const [formStatus, setFormStatus] = useState<string>('ACTIVE');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setError(null);
    setEditUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('STAFF');
    setFormStatus('ACTIVE');
    setModalMode('add');
  };

  const openEdit = (u: StaffUserDto) => {
    setError(null);
    setEditUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormStatus(u.status);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditUser(null);
    setError(null);
  };

  const submitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (modalMode === 'add') {
        const created = await createAdminUser({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          status: formStatus,
        });
        setUsers((prev) => [created, ...prev]);
      } else if (modalMode === 'edit' && editUser) {
        const updated = await patchAdminUser(editUser.id, {
          name: formName.trim(),
          role: formRole,
          status: formStatus,
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        );
      }
      setModalMode(null);
      setEditUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: StaffUserDto) => {
    const next = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (next === 'INACTIVE') {
      const ok = await confirmDialog({
        title: 'ปิดการใช้งาน',
        message: `ต้องการปิดการใช้งาน ${u.name} (${u.email}) หรือไม่?`,
        confirmLabel: 'ปิดใช้งาน',
        cancelLabel: 'ยกเลิก',
        variant: 'danger',
      });
      if (!ok) return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await patchAdminUser(u.id, { status: next });
      setUsers((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update status',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold text-on-surface">
            Access & Permissions
          </h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={openAdd}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg font-label text-xs font-bold uppercase tracking-widest text-on-primary hover:opacity-90 transition-opacity bloom-effect disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {error && !modalMode && (
        <p className="text-sm text-error font-body" role="alert">
          {error}{' '}
          <button
            type="button"
            onClick={load}
            className="underline text-primary"
          >
            Retry
          </button>
        </p>
      )}

      <div className="bg-surface rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/20">
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  User
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Role
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Status
                </th>
                <th className="p-4 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="font-body text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-on-surface-variant"
                  >
                    No staff users yet. Run{' '}
                    <code className="text-xs bg-surface-container px-1 rounded">
                      npm run db:seed -w backend
                    </code>{' '}
                    or add a user above.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
                  >
                    <td className="p-4 font-medium text-on-surface flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 text-on-surface-variant">{user.email}</td>
                    <td className="p-4 text-on-surface-variant">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-primary shrink-0" />
                        {roleLabel(user.role)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {user.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEdit(user)}
                          disabled={saving}
                          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container disabled:opacity-40"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title={
                            user.status === 'ACTIVE'
                              ? 'Deactivate'
                              : 'Activate'
                          }
                          onClick={() => toggleStatus(user)}
                          disabled={saving}
                          className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container disabled:opacity-40"
                        >
                          {user.status === 'ACTIVE' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MotionModal
        open={modalMode != null}
        onBackdropClick={() => !saving && closeModal()}
        panelClassName="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden"
        ariaLabelledBy="staff-modal-title"
      >
        {modalMode ? (
          <>
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low">
              <h3
                id="staff-modal-title"
                className="font-headline text-xl font-semibold text-on-surface"
              >
                {modalMode === 'add' ? 'Add staff user' : 'Edit staff user'}
              </h3>
            </div>
            <form onSubmit={submitModal} className="p-6 space-y-4">
              {error && modalMode && (
                <p className="text-sm text-error">{error}</p>
              )}
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                  Name
                </label>
                <input
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  readOnly={modalMode === 'edit'}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm read-only:bg-surface-container-low read-only:text-on-surface-variant"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <MotionButton
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </MotionButton>
                <MotionButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saving}
                  className="flex-1"
                >
                  {saving ? 'Saving…' : 'Save'}
                </MotionButton>
              </div>
            </form>
          </>
        ) : null}
      </MotionModal>
    </div>
  );
}
