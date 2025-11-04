'use client';

import { useEffect, useState } from 'react';

export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';

interface LearningModule {
  id: string;
  title: string;
  description?: string;
  status: ModuleStatus;
  notes?: string;
  targetDate?: string | null;
}

interface LearningPathProps {
  employeeId: string;
  initialModules?: string[]; // simple titles; will be expanded to modules
  boxNumber?: number; // 9-box number
}

export default function LearningPath({ employeeId, initialModules = [], boxNumber }: LearningPathProps) {
  const storageKey = `learningPath:${employeeId}`;
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [dbPathId, setDbPathId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from database first, fallback to localStorage
  useEffect(() => {
    loadFromDatabase();
  }, [employeeId]);

  const loadFromDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learning-paths?employeeId=${employeeId}`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Use the most recent learning path
        const latest = data[0];
        setDbPathId(latest.id);
        setModules(latest.modules.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          status: m.status as ModuleStatus,
          notes: m.notes || '',
          targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : null,
        })));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading from database:', error);
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setModules(JSON.parse(raw));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }

    // Initialize from initialModules
    const initial = initialModules.map((t, i) => ({
      id: `temp-${Date.now()}-${i}`,
      title: t,
      description: '',
      status: 'not-started' as ModuleStatus,
      notes: '',
      targetDate: null,
    }));
    setModules(initial);
    setLoading(false);
  };

  // Persist to localStorage as backup
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(modules));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
  }, [modules, loading]);

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      const currentYear = new Date().getFullYear();
      const payload = {
        employeeId,
        title: `Learning Path ${currentYear}${boxNumber ? ` - Box ${boxNumber}` : ''}`,
        description: `Jalur pembelajaran untuk pengembangan kompetensi`,
        basedOnBox: boxNumber || null,
        year: currentYear,
        modules: modules.map((m, index) => ({
          title: m.title,
          description: m.description || '',
          status: m.status,
          notes: m.notes || '',
          targetDate: m.targetDate || null,
          order: index,
        })),
      };

      const method = dbPathId ? 'PUT' : 'POST';
      const body = dbPathId ? { ...payload, id: dbPathId } : payload;

      const res = await fetch('/api/learning-paths', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const saved = await res.json();
        setDbPathId(saved.id);
        setModules(saved.modules.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          status: m.status as ModuleStatus,
          notes: m.notes || '',
          targetDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : null,
        })));
        alert('✅ Learning path berhasil disimpan ke database!');
      } else {
        const error = await res.json();
        alert(`❌ Gagal menyimpan: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      alert('❌ Terjadi kesalahan saat menyimpan learning path');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = (id: string, status: ModuleStatus) => {
    setModules(ms => ms.map(m => m.id === id ? { ...m, status } : m));
  };

  const updateField = (id: string, field: keyof LearningModule, value: any) => {
    setModules(ms => ms.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addModule = (title: string) => {
    const m: LearningModule = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      title,
      description: '',
      status: 'not-started',
      notes: '',
      targetDate: null,
    };
    setModules(ms => [...ms, m]);
  };

  const removeModule = (id: string) => {
    setModules(ms => ms.filter(m => m.id !== id));
  };

  const completedCount = modules.filter(m => m.status === 'completed').length;
  const progressPct = modules.length === 0 ? 0 : Math.round((completedCount / modules.length) * 100);

  if (loading) {
    return (
      <div className="mt-6 bg-white p-4 rounded-lg border">
        <p className="text-center text-gray-600">⏳ Loading learning path...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h5 className="text-lg font-bold">Learning Path</h5>
          <p className="text-sm text-gray-700">Kemajuan: <span className="font-semibold">{progressPct}%</span> ({completedCount}/{modules.length})</p>
          {dbPathId && (
            <p className="text-xs text-green-600 mt-1">✅ Sinkron dengan database</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-40">
            <div className="bg-gray-200 h-3 rounded overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <button
            onClick={saveToDatabase}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {saving ? '💾 Saving...' : dbPathId ? '💾 Update' : '💾 Simpan'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {modules.map((m) => (
          <div key={m.id} className="border rounded p-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h6 className="font-semibold">{m.title}</h6>
                  <span className="text-xs text-gray-500">{m.targetDate ? `Target: ${m.targetDate}` : ''}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{m.description || <em className="text-gray-400">(Deskripsi belum tersedia)</em>}</p>
                {m.notes && <p className="text-sm text-gray-600 mt-2">Catatan: {m.notes}</p>}
              </div>

              <div className="ml-4 text-right flex flex-col items-end gap-2">
                <div className="flex flex-col items-end">
                  <label className="text-xs text-gray-600">Status</label>
                  <select
                    value={m.status}
                    onChange={(e) => setStatus(m.id, e.target.value as ModuleStatus)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="not-started">Belum Mulai</option>
                    <option value="in-progress">Sedang Berlangsung</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    const notes = prompt('Catatan untuk modul ini:', m.notes || '');
                    if (notes !== null) updateField(m.id, 'notes', notes);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ✎ Catatan
                </button>

                <button
                  onClick={() => {
                    const date = prompt('Target tanggal (YYYY-MM-DD):', m.targetDate || '');
                    if (date !== null) updateField(m.id, 'targetDate', date || null);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  📅 Target
                </button>

                <button
                  onClick={() => removeModule(m.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        ))}

        {modules.length === 0 && (
          <div className="text-sm text-gray-500 italic">Belum ada modul pembelajaran. Tambahkan modul untuk memulai learning path.</div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input id="new-module-input" placeholder="Judul modul baru" className="flex-1 border rounded px-3 py-2" />
        <button
          onClick={() => {
            const el = document.getElementById('new-module-input') as HTMLInputElement | null;
            if (!el) return;
            const title = el.value.trim();
            if (!title) return alert('Isi judul modul');
            addModule(title);
            el.value = '';
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Tambah Modul
        </button>

        <button
          onClick={() => {
            const data = JSON.stringify(modules, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `learning-path-${employeeId}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-gray-100 border px-3 py-2 rounded hover:bg-gray-200"
        >
          Export
        </button>
      </div>
    </div>
  );
}
