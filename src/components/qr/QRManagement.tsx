import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  RefreshCw, 
  Building, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Person, Student } from '../../types';
import { generateQrDataUrl } from '../../services/qrSecurity';

export const QRManagement: React.FC = () => {
  const { people, students, settings, regeneratePersonQr } = useApp();
  const [badgeTarget, setBadgeTarget] = useState<'STAFF' | 'STUDENTS'>('STAFF');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Preload QR images
  useEffect(() => {
    const loadQrs = async () => {
      const map: Record<string, string> = {};
      const targetPool = badgeTarget === 'STAFF' ? people.slice(0, 24) : students.slice(0, 24);
      for (const item of targetPool) {
        if (item.qrToken) {
          map[item.id] = await generateQrDataUrl(item.qrToken);
        }
      }
      setQrImages(prev => ({ ...prev, ...map }));
    };
    loadQrs();
  }, [badgeTarget, people, students]);

  const filteredItems = (badgeTarget === 'STAFF' ? people : students).filter(item => {
    const name = (item as any).fullName || `${(item as any).firstName} ${(item as any).lastName}`;
    const dept = (item as any).departmentOrClass || (item as any).className || '';
    const category = (item as any).category || 'Student';

    const matchesSearch = `${name} ${item.id} ${dept} ${category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(t => t.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegenerate = async (id: string) => {
    const newToken = await regeneratePersonQr(id);
    const newUrl = await generateQrDataUrl(newToken);
    setQrImages(prev => ({ ...prev, [id]: newUrl }));
  };

  const getQrUrl = (id: string, token: string) => {
    return qrImages[id] || '';
  };

  const handleBatchGenerate = async () => {
    setIsGeneratingBatch(true);
    const map: Record<string, string> = {};
    const pool = badgeTarget === 'STAFF' ? people : students;
    for (const item of pool) {
      if (item.qrToken) {
        map[item.id] = await generateQrDataUrl(item.qrToken);
      }
    }
    setQrImages(map);
    setIsGeneratingBatch(false);
  };

  const displayList = selectedIds.length > 0
    ? (badgeTarget === 'STAFF' ? people : students).filter(t => selectedIds.includes(t.id))
    : filteredItems.slice(0, 18);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900">QR Code Badge Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate, print and issue official cryptographic QR attendance ID cards for all workforce staff and enrolled students
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBatchGenerate}
            disabled={isGeneratingBatch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isGeneratingBatch ? 'animate-spin' : ''}`} />
            <span>{isGeneratingBatch ? 'Generating All...' : 'Batch Generate Previews'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Selected Cards</span>
          </button>
        </div>
      </div>

      {/* Target Category Switcher & Filter Bar (Hidden during print) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBadgeTarget('STAFF'); setSelectedIds([]); setSelectedCategory('ALL'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                badgeTarget === 'STAFF'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              School Workforce Staff Badges (75)
            </button>
            <button
              onClick={() => { setBadgeTarget('STUDENTS'); setSelectedIds([]); setSelectedCategory('ALL'); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                badgeTarget === 'STUDENTS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Student Attendance Cards (175)
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {selectedIds.length > 0 ? (
              <span className="text-sky-600 font-bold">{selectedIds.length} cards selected for printing</span>
            ) : (
              <span>Showing preview roster</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {selectedIds.length === filteredItems.length ? (
                <CheckSquare className="w-4 h-4 text-sky-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredItems.length})</span>
            </button>

            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={badgeTarget === 'STAFF' ? "Search staff name, ID..." : "Search student, admission number..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Category / Department Filter */}
            {badgeTarget === 'STAFF' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-semibold"
              >
                <option value="ALL">All Categories</option>
                <option value="Teacher">Teachers</option>
                <option value="Cleaner">Cleaners</option>
                <option value="Driver">Bus Drivers</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Administrator">Administrators</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid: Specifically formatted for high-definition print and on-screen display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
        {displayList.map((t: any) => {
          const isSelected = selectedIds.includes(t.id);
          const qrSrc = getQrUrl(t.id, t.qrToken);
          const fullName = t.fullName || `${t.title || ''} ${t.firstName} ${t.lastName}`.trim();
          const pCategory = t.category || (badgeTarget === 'STUDENTS' ? 'STUDENT' : 'STAFF');
          const pSub = t.departmentOrClass || t.className || t.department || '';

          return (
            <div
              key={t.id}
              className={`bg-white rounded-3xl border-2 transition shadow-md overflow-hidden flex flex-col justify-between print:shadow-none print:break-inside-avoid ${
                isSelected ? 'border-sky-500 ring-2 ring-sky-200' : 'border-slate-300'
              }`}
            >
              {/* Card Header with School Logo & Branding */}
              <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white text-xs">
                      RC
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-white leading-tight">
                        {settings.schoolName}
                      </h4>
                      <p className="text-[9px] text-sky-300 tracking-wider font-semibold uppercase">
                        {pCategory} ATTENDANCE ID BADGE
                      </p>
                    </div>
                  </div>

                  <div className="print:hidden">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(t.id)}
                      className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col items-center text-center">
                {/* Photo */}
                <img
                  src={t.avatar || t.photo}
                  alt={t.firstName || fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs mb-2"
                />

                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {fullName}
                </h3>
                <p className="text-xs font-semibold text-sky-700 mt-0.5">
                  {t.position || (badgeTarget === 'STUDENTS' ? `House: ${t.house || 'Blue Sapphire'}` : pCategory)}
                </p>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {pSub}
                </div>

                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                  <span>{badgeTarget === 'STUDENTS' ? 'ADM NO:' : 'STAFF ID:'}</span>
                  <span className="text-sky-700">{t.admissionNumber || t.id}</span>
                </div>

                {/* QR Code Container */}
                <div className="my-4 p-2 bg-white rounded-2xl border-2 border-slate-800 shadow-inner flex flex-col items-center">
                  {qrSrc ? (
                    <img
                      src={qrSrc}
                      alt={`QR code for ${t.id}`}
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-slate-400 animate-pulse" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                    Scan to record attendance
                  </span>
                </div>

                <div className="text-[9px] text-slate-400 font-mono">
                  SECURE CRYPTOGRAPHIC TOKEN • VALID 2026/2027
                </div>
              </div>

              {/* Card Footer Actions (Hidden on Print) */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
                <button
                  onClick={() => handleRegenerate(t.id)}
                  className="text-slate-600 hover:text-indigo-600 font-semibold flex items-center gap-1"
                  title="Regenerate Token"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>

                {qrSrc && (
                  <a
                    href={qrSrc}
                    download={`${t.id}_${badgeTarget}_Badge.png`}
                    className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
