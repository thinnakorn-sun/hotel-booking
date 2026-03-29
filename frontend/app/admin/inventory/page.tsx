"use client";

import Image from 'next/image';
import { Search, Filter, X, Plus } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDialog } from '@/components/providers/app-dialog-provider';
import { MotionButton } from '@/components/ui/motion-button';
import { MotionModal } from '@/components/ui/motion-modal';
import {
  createSuite,
  fetchSuites,
  patchSuiteStatus,
} from '@/lib/api/suites';
import {
  SUITE_STATUSES,
  getSuiteStatusBadgeClass,
  getSuiteStatusLabel,
  getSuiteStatusManageButtonClass,
  isMaintenanceStatus,
  isSuiteStatus,
  type SuiteStatusValue,
} from '@/lib/domain/suite-status';
import {
  SUITE_CATEGORIES,
  getSuiteCategoryLabel,
} from '@/lib/domain/suite-category';
import { getSuiteImageFallbackUrl } from '@/lib/env/public-env';
import type { SuiteDto } from '@/lib/types/suite';

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suites, setSuites] = useState<SuiteDto[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<SuiteDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addName, setAddName] = useState('');
  const [addRoom, setAddRoom] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addCategory, setAddCategory] = useState<string>('SUITE');
  const [addImageUrl, setAddImageUrl] = useState('');
  const imageFallback = useMemo(() => getSuiteImageFallbackUrl(), []);

  const loadSuites = useCallback(async () => {
    try {
      const data = await fetchSuites();
      setSuites(data);
    } catch (error) {
      console.error('Failed to fetch suites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuites();
  }, [loadSuites]);

  const q = searchQuery.toLowerCase();
  const filteredSuites = suites.filter(
    (suite) =>
      suite.name.toLowerCase().includes(q) ||
      suite.roomNumber.toLowerCase().includes(q) ||
      suite.status.toLowerCase().includes(q) ||
      (suite.category ?? '').toLowerCase().includes(q),
  );

  const statusCounts = useMemo(() => {
    const counts: Record<SuiteStatusValue, number> = {
      AVAILABLE: 0,
      RESERVED: 0,
      OCCUPIED: 0,
      MAINTENANCE: 0,
    };
    let other = 0;
    for (const suite of suites) {
      if (isSuiteStatus(suite.status)) counts[suite.status]++;
      else other++;
    }
    return { counts, other };
  }, [suites]);

  function suiteStatusDisplay(status: string): string {
    return isSuiteStatus(status) ? getSuiteStatusLabel(status) : status;
  }

  const handleStatusChange = async (newStatus: SuiteStatusValue) => {
    if (!selectedSuite) return;
    try {
      await patchSuiteStatus(selectedSuite.id, newStatus);
      const data = await fetchSuites();
      setSuites(data);
      setSelectedSuite(null);
      await alert({
        title: 'อัปเดตแล้ว',
        message: `สถานะ ${selectedSuite.name} เป็น ${getSuiteStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      await alert({
        title: 'ไม่สำเร็จ',
        message: 'อัปเดตสถานะไม่สำเร็จ',
      });
    }
  };

  const submitAddSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(addPrice);
    if (
      !addName.trim() ||
      !addRoom.trim() ||
      !addDesc.trim() ||
      Number.isNaN(price) ||
      price < 0
    ) {
      await alert({
        title: 'ข้อมูลไม่ครบ',
        message: 'กรุณากรอกชื่อ หมายเลขห้อง คำอธิบาย และราคาที่ถูกต้อง',
      });
      return;
    }
    setAddSaving(true);
    try {
      await createSuite({
        name: addName.trim(),
        roomNumber: addRoom.trim(),
        description: addDesc.trim(),
        pricePerNight: price,
        category: addCategory,
        imageUrl: addImageUrl.trim() || undefined,
        status: 'AVAILABLE',
      });
      setShowAdd(false);
      setAddName('');
      setAddRoom('');
      setAddDesc('');
      setAddPrice('');
      setAddCategory('SUITE');
      setAddImageUrl('');
      const data = await fetchSuites();
      setSuites(data);
    } catch (err) {
      await alert({
        title: 'ไม่สำเร็จ',
        message: err instanceof Error ? err.message : 'สร้างห้องไม่สำเร็จ',
      });
    } finally {
      setAddSaving(false);
    }
  };

  const modalCurrentStatus: SuiteStatusValue = selectedSuite
    ? isSuiteStatus(selectedSuite.status)
      ? selectedSuite.status
      : SUITE_STATUSES[0]
    : SUITE_STATUSES[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-2xl font-semibold text-on-surface mb-1">
            Suite Inventory
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Manage availability, status, and maintenance schedules.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suites..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-outline-variant/30 rounded-lg font-body text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <MotionButton
            variant="primary"
            size="md"
            type="button"
            onClick={() => setShowAdd(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add suite
          </MotionButton>
          <MotionButton
            variant="secondary"
            size="md"
            type="button"
            onClick={() =>
              void alert({
                title: 'ตัวกรอง',
                message: 'ตัวเลือกกรองขั้นสูงจะเปิดใช้งานภายหลัง',
              })
            }
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filter
          </MotionButton>
        </div>
      </div>

      {!isLoading && suites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {SUITE_STATUSES.map((st) => (
            <div
              key={st}
              className="bg-surface rounded-xl border border-outline-variant/20 p-4 shadow-sm"
            >
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">
                {getSuiteStatusLabel(st)}
              </span>
              <span className="font-headline text-3xl font-semibold text-on-surface tabular-nums">
                {statusCounts.counts[st]}
              </span>
            </div>
          ))}
          {statusCounts.other > 0 && (
            <div className="bg-surface rounded-xl border border-outline-variant/20 p-4 shadow-sm">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">
                Other
              </span>
              <span className="font-headline text-3xl font-semibold text-on-surface tabular-nums">
                {statusCounts.other}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant font-body">
            Loading suites...
          </div>
        ) : filteredSuites.length === 0 ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant font-body">
            No suites found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredSuites.map((suite) => (
            <div
              key={suite.id}
              className={`bg-surface rounded-xl border border-outline-variant/20 overflow-hidden shadow-sm group ${
                isMaintenanceStatus(suite.status) ? 'opacity-75' : ''
              }`}
            >
              <div className="h-48 relative overflow-hidden">
                <Image
                  src={suite.imageUrl || imageFallback}
                  alt={suite.name}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                    isMaintenanceStatus(suite.status) ? 'grayscale' : ''
                  }`}
                  referrerPolicy="no-referrer"
                />
                <div
                  className={`absolute top-3 right-3 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm ${getSuiteStatusBadgeClass(suite.status)}`}
                >
                  {suiteStatusDisplay(suite.status)}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline text-lg font-semibold text-on-surface">
                    {suite.name}
                  </h3>
                  <span className="font-label text-xs font-bold text-primary">
                    {suite.roomNumber}
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface-variant mb-4 line-clamp-2">
                  {suite.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                  <span
                    className={`font-label text-sm font-medium ${
                      isMaintenanceStatus(suite.status)
                        ? 'text-error'
                        : 'text-on-surface'
                    }`}
                  >
                    ${suite.pricePerNight}{' '}
                    <span className="text-[10px] text-outline uppercase">
                      / Night
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSuite(suite)}
                    className="text-primary font-label text-xs font-bold uppercase tracking-widest hover:underline"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MotionModal
        open={showAdd}
        onBackdropClick={() => !addSaving && setShowAdd(false)}
        panelClassName="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline text-xl font-semibold text-on-surface">
                New suite
              </h3>
              <button
                type="button"
                onClick={() => !addSaving && setShowAdd(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitAddSuite} className="p-6 space-y-4">
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Name
                </label>
                <input
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Room number
                </label>
                <input
                  required
                  value={addRoom}
                  onChange={(e) => setAddRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Category (public catalog tab)
                </label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                >
                  {SUITE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {getSuiteCategoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Description (shown to guests)
                </label>
                <textarea
                  required
                  rows={3}
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Price / night (USD)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={addPrice}
                  onChange={(e) => setAddPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div>
                <label className="font-label text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={addImageUrl}
                  onChange={(e) => setAddImageUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <MotionButton
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => setShowAdd(false)}
                  disabled={addSaving}
                  className="flex-1"
                >
                  Cancel
                </MotionButton>
                <MotionButton
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={addSaving}
                  className="flex-1"
                >
                  {addSaving ? 'Saving…' : 'Create suite'}
                </MotionButton>
              </div>
            </form>
      </MotionModal>

      <MotionModal
        open={selectedSuite != null}
        onBackdropClick={() => setSelectedSuite(null)}
        panelClassName="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        {selectedSuite ? (
          <>
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline text-xl font-semibold text-on-surface">
                Manage Suite
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSuite(null)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-headline text-lg font-semibold text-on-surface">
                    {selectedSuite.name}
                  </span>
                  <span className="font-label text-xs font-bold text-primary">
                    {selectedSuite.roomNumber}
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface-variant">
                  Current Status:{' '}
                  <strong className="text-on-surface">
                    {suiteStatusDisplay(selectedSuite.status)}
                  </strong>
                </p>
              </div>

              <div>
                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-3">
                  Update Status
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SUITE_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(status)}
                      className={getSuiteStatusManageButtonClass(
                        status,
                        modalCurrentStatus,
                      )}
                    >
                      {getSuiteStatusLabel(status)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </MotionModal>
    </div>
  );
}
