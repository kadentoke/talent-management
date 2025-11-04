'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface OSDMDashboardProps {
  session: Session;
}

export default function OSDMDashboard({ session }: OSDMDashboardProps) {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedJobPosition, setSelectedJobPosition] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [selectedJobForRecommendation, setSelectedJobForRecommendation] = useState<string>('');
  const [recommendedCandidates, setRecommendedCandidates] = useState<any[]>([]);
  const [analyzingRecommendations, setAnalyzingRecommendations] = useState(false);
  const [editingJobPosition, setEditingJobPosition] = useState<any>(null);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    unit: '',
    level: '',
    description: '',
    isAvailable: true,
    competencies: [] as { competencyId: string; requiredLevel: number; priority: string }[],
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'employees') {
        const res = await fetch('/api/employees');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.employees ?? data?.data ?? []);
        setEmployees(list || []);
      } else if (activeTab === 'changes') {
        const res = await fetch('/api/change-requests');
        const data = await res.json();
        // Defensive: ensure the UI always receives an array even if the API
        // returns an error object or a wrapped payload when the DB is unreachable.
        const list = Array.isArray(data) ? data : (data?.changeRequests ?? data?.data ?? []);
        setChangeRequests(list || []);
      } else if (activeTab === 'positions') {
        const [posRes, compRes] = await Promise.all([
          fetch('/api/job-positions'),
          fetch('/api/competencies'),
        ]);
        const positions = await posRes.json();
        const comps = await compRes.json();
        setJobPositions(positions);
        setCompetencies(comps);
      } else if (activeTab === 'matching') {
        const [empRes, posRes, matchRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/job-positions?available=true'),
          fetch('/api/job-match'),
        ]);
  const emp = await empRes.json();
  const empList = Array.isArray(emp) ? emp : (emp?.employees ?? emp?.data ?? []);
        const pos = await posRes.json();
        const matches = await matchRes.json();
  setEmployees(empList || []);
        setJobPositions(pos);
        setJobMatches(matches);
      } else if (activeTab === 'recommendations') {
        const [empRes, posRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/job-positions?available=true'),
        ]);
  const emp = await empRes.json();
  const empList = Array.isArray(emp) ? emp : (emp?.employees ?? emp?.data ?? []);
        const pos = await posRes.json();
  setEmployees(empList || []);
        setJobPositions(pos);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (id: string, status: 'APPROVED' | 'REJECTED', note: string = '') => {
    try {
      const res = await fetch('/api/change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, reviewNote: note }),
      });

      if (res.ok) {
        alert(`Perubahan berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating change request:', error);
    }
  };

  const handleAnalyzeMatch = async (employeeId: string, jobPositionId: string) => {
    setAnalyzing(true);
    setLatestAnalysis(null); // Clear previous analysis
    try {
      const res = await fetch('/api/job-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, jobPositionId }),
      });

      const data = await res.json();
      
      // Store the latest analysis for inline display
      setLatestAnalysis({
        ...data,
        employeeName: selectedEmployee?.fullName,
        jobPositionTitle: jobPositions.find(j => j.id === jobPositionId)?.title,
      });
      
      // Refresh the matches list
      fetchData();
    } catch (error) {
      console.error('Error analyzing match:', error);
      alert('Gagal menganalisis kecocokan');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRecommendCandidates = async (jobPositionId: string) => {
    setAnalyzingRecommendations(true);
    setRecommendedCandidates([]);
    
    try {
      // Analyze all employees for this job position
      const analysisPromises = employees.map(async (employee) => {
        const res = await fetch('/api/job-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            employeeId: employee.id, 
            jobPositionId 
          }),
        });
        const data = await res.json();
        return {
          employee,
          analysis: data,
        };
      });

      const results = await Promise.all(analysisPromises);
      
      // Sort by match score (highest first)
      const sortedResults = results.sort((a, b) => 
        (b.analysis.matchScore || 0) - (a.analysis.matchScore || 0)
      );

      setRecommendedCandidates(sortedResults);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      alert('Gagal mendapatkan rekomendasi kandidat');
    } finally {
      setAnalyzingRecommendations(false);
    }
  };

  const handleSaveJobPosition = async () => {
    try {
      const method = editingJobPosition ? 'PUT' : 'POST';
      const url = '/api/job-positions';
      
      const payload = editingJobPosition 
        ? { id: editingJobPosition.id, ...jobFormData }
        : jobFormData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editingJobPosition ? 'Jabatan berhasil diupdate' : 'Jabatan berhasil ditambahkan');
        setEditingJobPosition(null);
        setShowAddJobForm(false);
        setJobFormData({
          title: '',
          unit: '',
          level: '',
          description: '',
          isAvailable: true,
          competencies: [],
        });
        fetchData();
      } else {
        alert('Gagal menyimpan jabatan');
      }
    } catch (error) {
      console.error('Error saving job position:', error);
      alert('Terjadi kesalahan saat menyimpan jabatan');
    }
  };

  const handleEditJobPosition = (job: any) => {
    setEditingJobPosition(job);
    setJobFormData({
      title: job.title,
      unit: job.unit,
      level: job.level,
      description: job.description || '',
      isAvailable: job.isAvailable,
      competencies: job.competencies.map((jc: any) => ({
        competencyId: jc.competency.id,
        requiredLevel: jc.requiredLevel,
        priority: jc.priority,
      })),
    });
    setShowAddJobForm(true);
  };

  const handleToggleAvailability = async (jobId: string, currentStatus: boolean) => {
    try {
      const job = jobPositions.find(j => j.id === jobId);
      if (!job) return;

      const res = await fetch('/api/job-positions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          title: job.title,
          unit: job.unit,
          level: job.level,
          description: job.description,
          isAvailable: !currentStatus,
          competencies: job.competencies.map((jc: any) => ({
            competencyId: jc.competency.id,
            requiredLevel: jc.requiredLevel,
            priority: jc.priority,
          })),
        }),
      });

      if (res.ok) {
        alert(`Jabatan ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchData();
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Gagal mengubah status ketersediaan');
    }
  };

  const addCompetencyToJob = () => {
    if (competencies.length > 0) {
      setJobFormData({
        ...jobFormData,
        competencies: [
          ...jobFormData.competencies,
          { competencyId: competencies[0].id, requiredLevel: 1, priority: 'MEDIUM' },
        ],
      });
    }
  };

  const removeCompetencyFromJob = (index: number) => {
    setJobFormData({
      ...jobFormData,
      competencies: jobFormData.competencies.filter((_, i) => i !== index),
    });
  };

  const updateJobCompetency = (index: number, field: string, value: any) => {
    const updated = [...jobFormData.competencies];
    updated[index] = { ...updated[index], [field]: value };
    setJobFormData({ ...jobFormData, competencies: updated });
  };

  if (loading && activeTab !== 'matching') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-950 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🏛️ Dashboard OSDM</h1>
            <p className="text-sm text-yellow-200">{session.user.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-2 rounded-lg transition shadow-md hover:shadow-lg"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'employees'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Data Pegawai
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'changes'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Persetujuan Perubahan
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'positions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Jabatan & Kompetensi
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'matching'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Matching Talenta
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'recommendations'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-900 hover:text-blue-600'
              }`}
            >
              Rekomendasi Kandidat
            </button>
          </div>

          <div className="p-6">
            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Daftar Pegawai</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">NIP</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nama</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Jabatan</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Unit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Golongan</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{emp.nip}</td>
                          <td className="px-4 py-3 text-sm font-medium">{emp.fullName}</td>
                          <td className="px-4 py-3 text-sm">{emp.currentPosition || '-'}</td>
                          <td className="px-4 py-3 text-sm">{emp.unit || '-'}</td>
                          <td className="px-4 py-3 text-sm">{emp.golongan || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => setSelectedEmployee(emp)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Change Requests Tab */}
            {activeTab === 'changes' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Persetujuan Perubahan Data</h2>
                <div className="space-y-4">
                  {changeRequests.filter(r => r.status === 'PENDING').map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg">
                            {request.employee.fullName} - {request.type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-900">
                            Diajukan: {new Date(request.createdAt).toLocaleDateString('id-ID')}
                          </p>
                          {request.reason && (
                            <p className="text-sm text-gray-900 mt-1">
                              <span className="font-semibold">Alasan:</span> {request.reason}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm font-medium">
                          Menunggu Persetujuan
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="w-full bg-white border rounded p-3 mb-4 text-left hover:bg-gray-50"
                      >
                        <p className="text-sm font-semibold mb-1">📋 Klik untuk melihat detail data</p>
                        <p className="text-xs text-gray-900">
                          Tipe: {request.type} • NIP: {request.employee.nip}
                        </p>
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            if (confirm(`Setujui perubahan ${request.type.replace('_', ' ')} untuk ${request.employee.fullName}?`)) {
                              handleApproveReject(request.id, 'APPROVED');
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          ✓ Setujui
                        </button>
                        <button
                          onClick={() => {
                            const note = prompt('Alasan penolakan:');
                            if (note) {
                              handleApproveReject(request.id, 'REJECTED', note);
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          ✗ Tolak
                        </button>
                      </div>
                    </div>
                  ))}

                  {changeRequests.filter(r => r.status === 'PENDING').length === 0 && (
                    <p className="text-gray-800 text-center py-8">
                      Tidak ada perubahan yang menunggu persetujuan
                    </p>
                  )}

                  {/* History of Processed Requests */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Riwayat Persetujuan</h3>
                    <div className="space-y-2">
                      {changeRequests
                        .filter(r => r.status !== 'PENDING')
                        .slice(0, 5)
                        .map((request) => (
                          <div
                            key={request.id}
                            className={`border rounded p-3 ${
                              request.status === 'APPROVED'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">
                                  {request.employee.fullName} - {request.type.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-gray-900">
                                  {new Date(request.reviewedAt).toLocaleDateString('id-ID')}
                                  {request.reviewNote && ` • ${request.reviewNote}`}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  request.status === 'APPROVED'
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-red-200 text-red-800'
                                }`}
                              >
                                {request.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Positions Tab */}
            {activeTab === 'positions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Jabatan & Kompetensi</h2>
                  <button
                    onClick={() => {
                      setShowAddJobForm(true);
                      setEditingJobPosition(null);
                      setJobFormData({
                        title: '',
                        unit: '',
                        level: '',
                        description: '',
                        isAvailable: true,
                        competencies: [],
                      });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span>+</span> Tambah Jabatan Baru
                  </button>
                </div>

                {/* Job Position List */}
                <div className="space-y-4">
                  {jobPositions.map((job) => (
                    <div
                      key={job.id}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        job.isAvailable 
                          ? 'bg-white border-green-300 hover:shadow-md' 
                          : 'bg-gray-50 border-gray-300 opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-xl">{job.title}</h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                job.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              {job.isAvailable ? '✓ Tersedia' : '✗ Tidak Tersedia'}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium">{job.unit}</p>
                          <p className="text-sm text-gray-900">Level: {job.level}</p>
                          {job.description && (
                            <p className="text-sm text-gray-900 mt-2 italic">{job.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAvailability(job.id, job.isAvailable)}
                            className={`px-4 py-2 rounded font-medium text-sm transition ${
                              job.isAvailable
                                ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                : 'bg-green-200 text-green-700 hover:bg-green-300'
                            }`}
                            title={job.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {job.isAvailable ? '🔒 Tutup' : '🔓 Buka'}
                          </button>
                          <button
                            onClick={() => handleEditJobPosition(job)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center mb-3">
                          <p className="font-semibold text-gray-900">Kompetensi yang Dibutuhkan:</p>
                          <span className="text-sm text-gray-800">
                            {job.competencies.length} kompetensi
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {job.competencies.map((jc: any) => (
                            <div
                              key={jc.id}
                              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg border"
                            >
                              <div className="flex-1">
                                <span className="text-sm font-medium">{jc.competency.name}</span>
                                <p className="text-xs text-gray-800">{jc.competency.category}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                  Level {jc.requiredLevel}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded font-medium ${
                                    jc.priority === 'HIGH'
                                      ? 'bg-red-100 text-red-800'
                                      : jc.priority === 'MEDIUM'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  {jc.priority}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {job.competencies.length === 0 && (
                          <p className="text-sm text-gray-800 italic text-center py-3">
                            Belum ada kompetensi yang ditentukan
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Tab */}
            {activeTab === 'matching' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">AI Talent Matching</h2>

                {/* Matching Tool */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4">Analisis Kecocokan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Pilih Pegawai</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        onChange={(e) => setSelectedEmployee(employees.find(emp => emp.id === e.target.value))}
                      >
                        <option value="">-- Pilih Pegawai --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} - {emp.currentPosition}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pilih Jabatan</label>
                      <select
                        className="w-full border rounded px-3 py-2"
                        value={selectedJobPosition}
                        onChange={(e) => setSelectedJobPosition(e.target.value)}
                      >
                        <option value="">-- Pilih Jabatan --</option>
                        {jobPositions.filter(j => j.isAvailable).map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedEmployee && selectedJobPosition) {
                        handleAnalyzeMatch(selectedEmployee.id, selectedJobPosition);
                      } else {
                        alert('Pilih pegawai dan jabatan terlebih dahulu');
                      }
                    }}
                    disabled={analyzing}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {analyzing ? 'Menganalisis...' : 'Analisis dengan AI'}
                  </button>
                </div>

                {/* Latest Analysis Result - Inline Display */}
                {latestAnalysis && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-blue-900">Hasil Analisis Terbaru</h3>
                        <p className="text-sm text-gray-900 mt-1">
                          {latestAnalysis.employeeName} → {latestAnalysis.jobPositionTitle}
                        </p>
                      </div>
                      <button
                        onClick={() => setLatestAnalysis(null)}
                        className="text-gray-800 hover:text-gray-900"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white rounded-lg p-4 text-center shadow">
                        <div className={`text-4xl font-bold mb-2 ${
                          latestAnalysis.matchScore >= 80 ? 'text-green-600' :
                          latestAnalysis.matchScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {latestAnalysis.matchScore}%
                        </div>
                        <p className="text-sm text-gray-900">Skor Kecocokan</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow md:col-span-2">
                        <p className="font-semibold text-sm text-gray-900 mb-2">Ringkasan:</p>
                        <p className="text-sm text-gray-800">{latestAnalysis.summary}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-bold text-green-700 mb-3 flex items-center">
                          <span className="text-xl mr-2">✓</span> Kekuatan Kandidat
                        </p>
                        <ul className="space-y-2">
                          {Array.isArray(latestAnalysis.strengths) ? 
                            latestAnalysis.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="flex items-start text-sm">
                                <span className="text-green-600 mr-2 mt-1">•</span>
                                <span className="text-gray-900">{strength}</span>
                              </li>
                            ))
                            : <li className="text-gray-800 text-sm italic">Data tidak tersedia</li>
                          }
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-bold text-red-700 mb-3 flex items-center">
                          <span className="text-xl mr-2">⚠</span> Gap Kompetensi
                        </p>
                        <ul className="space-y-2">
                          {Array.isArray(latestAnalysis.gaps) ?
                            latestAnalysis.gaps.map((gap: string, idx: number) => (
                              <li key={idx} className="flex items-start text-sm">
                                <span className="text-red-600 mr-2 mt-1">•</span>
                                <span className="text-gray-900">{gap}</span>
                              </li>
                            ))
                            : <li className="text-gray-800 text-sm italic">Data tidak tersedia</li>
                          }
                        </ul>
                      </div>
                    </div>

                    {latestAnalysis.recommendation && (
                      <div className="bg-white rounded-lg p-4 shadow">
                        <p className="font-bold text-blue-700 mb-2 flex items-center">
                          <span className="text-xl mr-2">💡</span> Rekomendasi
                        </p>
                        <p className="text-sm text-gray-800">{latestAnalysis.recommendation}</p>
                      </div>
                    )}

                    {latestAnalysis.note && (
                      <p className="text-xs text-yellow-700 mt-4 bg-yellow-50 p-2 rounded">
                        ⚠️ {latestAnalysis.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Job Matches Results */}
                <h3 className="font-bold text-lg mb-4">Hasil Matching</h3>
                <div className="space-y-4">
                  {jobMatches
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .map((match) => (
                      <div key={match.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-lg">{match.employee.fullName}</h4>
                            <p className="text-gray-900">{match.jobPosition.title}</p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-3xl font-bold ${
                                match.matchScore >= 80
                                  ? 'text-green-600'
                                  : match.matchScore >= 60
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {match.matchScore}%
                            </div>
                            <p className="text-sm text-gray-800">Match Score</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-gray-900">{match.analysis}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-sm mb-2 text-green-700">Kekuatan:</p>
                            <ul className="text-sm space-y-1">
                              {(() => {
                                try {
                                  const strengths = typeof match.strengths === 'string' 
                                    ? JSON.parse(match.strengths) 
                                    : match.strengths;
                                  return Array.isArray(strengths) ? strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-green-600 mr-2">✓</span>
                                      <span>{strength}</span>
                                    </li>
                                  )) : <li className="text-gray-800 italic">Data tidak valid</li>;
                                } catch (error) {
                                  return <li className="text-gray-800 italic">Error parsing data</li>;
                                }
                              })()}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-sm mb-2 text-red-700">Gap:</p>
                            <ul className="text-sm space-y-1">
                              {(() => {
                                try {
                                  const gaps = typeof match.gaps === 'string'
                                    ? JSON.parse(match.gaps)
                                    : match.gaps;
                                  return Array.isArray(gaps) ? gaps.map((gap: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <span className="text-red-600 mr-2">✗</span>
                                      <span>{gap}</span>
                                    </li>
                                  )) : <li className="text-gray-800 italic">Data tidak valid</li>;
                                } catch (error) {
                                  return <li className="text-gray-800 italic">Error parsing data</li>;
                                }
                              })()}
                            </ul>
                          </div>
                        </div>

                        <p className="text-xs text-gray-800 mt-3">
                          Dianalisis: {new Date(match.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))}

                  {jobMatches.length === 0 && (
                    <p className="text-gray-800 text-center py-8">
                      Belum ada analisis matching. Gunakan tool di atas untuk menganalisis.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Rekomendasi Kandidat untuk Jabatan</h2>

                {/* Job Position Selection */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4">Pilih Jabatan</h3>
                  <p className="text-sm text-gray-900 mb-4">
                    Sistem akan menganalisis semua pegawai dan merekomendasikan kandidat terbaik untuk jabatan yang dipilih beserta alasannya.
                  </p>
                  <div className="flex gap-4">
                    <select
                      className="flex-1 border-2 border-purple-300 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
                      value={selectedJobForRecommendation}
                      onChange={(e) => setSelectedJobForRecommendation(e.target.value)}
                    >
                      <option value="">-- Pilih Jabatan --</option>
                      {jobPositions.filter(j => j.isAvailable).map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} - {job.unit} (Level {job.level})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedJobForRecommendation) {
                          handleRecommendCandidates(selectedJobForRecommendation);
                        } else {
                          alert('Pilih jabatan terlebih dahulu');
                        }
                      }}
                      disabled={analyzingRecommendations || !selectedJobForRecommendation}
                      className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {analyzingRecommendations ? 'Menganalisis...' : 'Cari Kandidat'}
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {analyzingRecommendations && (
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-900 font-medium">Sedang menganalisis {employees.length} kandidat...</p>
                    <p className="text-sm text-gray-800 mt-2">Proses ini mungkin memakan waktu beberapa detik</p>
                  </div>
                )}

                {/* Recommended Candidates Results */}
                {!analyzingRecommendations && recommendedCandidates.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">
                        Kandidat untuk: {jobPositions.find(j => j.id === selectedJobForRecommendation)?.title}
                      </h3>
                      <span className="text-sm text-gray-800">
                        {recommendedCandidates.length} kandidat dianalisis
                      </span>
                    </div>

                    <div className="space-y-4">
                      {recommendedCandidates.map((candidate, index) => {
                        const matchScore = candidate.analysis.matchScore || 0;
                        const strengths = Array.isArray(candidate.analysis.strengths) 
                          ? candidate.analysis.strengths 
                          : [];
                        const gaps = Array.isArray(candidate.analysis.gaps)
                          ? candidate.analysis.gaps
                          : [];

                        return (
                          <div 
                            key={candidate.employee.id} 
                            className={`border-2 rounded-lg p-5 bg-white shadow-md transition-all hover:shadow-lg ${
                              matchScore >= 80 ? 'border-green-300 bg-green-50' :
                              matchScore >= 60 ? 'border-yellow-300 bg-yellow-50' :
                              'border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center ${
                                  index === 0 ? 'bg-yellow-400 text-white' :
                                  index === 1 ? 'bg-gray-300 text-white' :
                                  index === 2 ? 'bg-orange-400 text-white' :
                                  'bg-gray-100 text-gray-900'
                                }`}>
                                  #{index + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-xl">{candidate.employee.fullName}</h4>
                                  <p className="text-gray-900">{candidate.employee.currentPosition}</p>
                                  <p className="text-sm text-gray-800">{candidate.employee.unit} • {candidate.employee.golongan}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-4xl font-bold ${
                                  matchScore >= 80 ? 'text-green-600' :
                                  matchScore >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {matchScore}%
                                </div>
                                <p className="text-sm text-gray-800">Skor Kecocokan</p>
                              </div>
                            </div>

                            {/* Summary */}
                            {candidate.analysis.summary && (
                              <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                                <p className="font-semibold text-sm text-blue-900 mb-1">Ringkasan Analisis:</p>
                                <p className="text-sm text-gray-800">{candidate.analysis.summary}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Strengths */}
                              <div className="bg-white border border-green-200 rounded-lg p-4">
                                <p className="font-bold text-green-700 mb-3 flex items-center">
                                  <span className="text-xl mr-2">✓</span> Kekuatan ({strengths.length})
                                </p>
                                {strengths.length > 0 ? (
                                  <ul className="space-y-2">
                                    {strengths.map((strength: string, idx: number) => (
                                      <li key={idx} className="flex items-start text-sm">
                                        <span className="text-green-600 mr-2 mt-1">•</span>
                                        <span className="text-gray-900">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-800 italic">Tidak ada data kekuatan</p>
                                )}
                              </div>

                              {/* Gaps */}
                              <div className="bg-white border border-red-200 rounded-lg p-4">
                                <p className="font-bold text-red-700 mb-3 flex items-center">
                                  <span className="text-xl mr-2">⚠</span> Gap Kompetensi ({gaps.length})
                                </p>
                                {gaps.length > 0 ? (
                                  <ul className="space-y-2">
                                    {gaps.map((gap: string, idx: number) => (
                                      <li key={idx} className="flex items-start text-sm">
                                        <span className="text-red-600 mr-2 mt-1">•</span>
                                        <span className="text-gray-900">{gap}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-800 italic">Tidak ada gap yang teridentifikasi</p>
                                )}
                              </div>
                            </div>

                            {/* Recommendation */}
                            {candidate.analysis.recommendation && (
                              <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                                <p className="font-bold text-purple-900 mb-2 flex items-center">
                                  <span className="text-xl mr-2">💡</span> Rekomendasi:
                                </p>
                                <p className="text-sm text-gray-800">{candidate.analysis.recommendation}</p>
                              </div>
                            )}

                            {/* Quick Stats */}
                            <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                              <div className="text-center">
                                <p className="text-xs text-gray-800">Sertifikasi</p>
                                <p className="font-bold text-blue-600">{candidate.employee.certifications?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-800">Penugasan</p>
                                <p className="font-bold text-blue-600">{candidate.employee.assignments?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-800">Jabatan</p>
                                <p className="font-bold text-blue-600">{candidate.employee.positionHistories?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-800">Pendidikan</p>
                                <p className="font-bold text-blue-600">{candidate.employee.educationHistories?.length || 0}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!analyzingRecommendations && recommendedCandidates.length === 0 && selectedJobForRecommendation && (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-800">Pilih jabatan dan klik "Cari Kandidat" untuk melihat rekomendasi</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && activeTab === 'employees' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">{selectedEmployee.fullName}</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-800 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile */}
              <div>
                <h4 className="font-bold text-lg mb-3">Data Diri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-900">NIP</label>
                    <p className="font-medium">{selectedEmployee.nip}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Golongan</label>
                    <p className="font-medium">{selectedEmployee.golongan || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Jabatan</label>
                    <p className="font-medium">{selectedEmployee.currentPosition || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Unit</label>
                    <p className="font-medium">{selectedEmployee.unit || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {selectedEmployee.certifications?.length > 0 && (
                <div>
                  <h4 className="font-bold text-lg mb-3">Sertifikasi</h4>
                  <div className="space-y-2">
                    {selectedEmployee.certifications.map((cert: any) => (
                      <div key={cert.id} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{cert.name}</p>
                        <p className="text-sm text-gray-900">{cert.issuer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedEmployee.educationHistories?.length > 0 && (
                <div>
                  <h4 className="font-bold text-lg mb-3">Pendidikan</h4>
                  <div className="space-y-2">
                    {selectedEmployee.educationHistories.map((edu: any) => (
                      <div key={edu.id} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-gray-900">
                          {edu.institution} - {edu.major}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                Detail Perubahan - {selectedRequest.employee.fullName}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-800 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">Tipe: {selectedRequest.type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-900">
                      Diajukan: {new Date(selectedRequest.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm">
                    {selectedRequest.status}
                  </span>
                </div>
                {selectedRequest.reason && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-2">
                    <p className="font-semibold text-sm">Alasan Pengajuan:</p>
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                )}
              </div>

              {/* Render based on type */}
              {selectedRequest.type === 'PROFILE' && (
                <div className="space-y-4">
                  <h4 className="font-bold">Perubahan Data Diri:</h4>
                  {(() => {
                    const newData = JSON.parse(selectedRequest.newData);
                    const oldData = selectedRequest.oldData ? JSON.parse(selectedRequest.oldData) : {};
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        {Object.keys(newData).map((key) => {
                          if (newData[key] !== oldData[key] && newData[key]) {
                            return (
                              <div key={key} className="border rounded p-3">
                                <p className="text-xs text-gray-900 uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                                <div className="mt-1">
                                  {oldData[key] && (
                                    <p className="text-sm text-red-600 line-through">
                                      Lama: {oldData[key]}
                                    </p>
                                  )}
                                  <p className="text-sm text-green-600 font-medium">
                                    Baru: {newData[key]}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedRequest.type === 'CERTIFICATION' && (
                <div>
                  <h4 className="font-bold mb-2">Sertifikasi Baru:</h4>
                  {(() => {
                    const data = JSON.parse(selectedRequest.newData);
                    return (
                      <div className="bg-gray-50 border rounded p-4">
                        <p className="font-semibold text-lg">{data.name}</p>
                        <p className="text-gray-900">Penerbit: {data.issuer}</p>
                        <p className="text-sm text-gray-900">
                          Tanggal Terbit: {data.issueDate ? new Date(data.issueDate).toLocaleDateString('id-ID') : '-'}
                        </p>
                        {data.expiryDate && (
                          <p className="text-sm text-gray-900">
                            Tanggal Kadaluarsa: {new Date(data.expiryDate).toLocaleDateString('id-ID')}
                          </p>
                        )}
                        {data.credential && (
                          <p className="text-sm text-gray-900">Kredensial: {data.credential}</p>
                        )}
                        {data.description && (
                          <p className="text-sm text-gray-900 mt-2">{data.description}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedRequest.type === 'ASSIGNMENT' && (
                <div>
                  <h4 className="font-bold mb-2">Penugasan Baru:</h4>
                  {(() => {
                    const data = JSON.parse(selectedRequest.newData);
                    return (
                      <div className="bg-gray-50 border rounded p-4">
                        <p className="font-semibold text-lg">{data.title}</p>
                        <p className="text-gray-900 mt-2">{data.description}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          {data.location && (
                            <p className="text-gray-900">📍 Lokasi: {data.location}</p>
                          )}
                          <p className="text-gray-900">
                            📅 Periode: {data.startDate ? new Date(data.startDate).toLocaleDateString('id-ID') : '-'}
                            {data.endDate ? ` - ${new Date(data.endDate).toLocaleDateString('id-ID')}` : ' - Sekarang'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedRequest.type === 'POSITION_HISTORY' && (
                <div>
                  <h4 className="font-bold mb-2">Riwayat Jabatan Baru:</h4>
                  {(() => {
                    const data = JSON.parse(selectedRequest.newData);
                    return (
                      <div className="bg-gray-50 border rounded p-4">
                        <p className="font-semibold text-lg">{data.position}</p>
                        <p className="text-gray-900">{data.unit}</p>
                        <p className="text-sm text-gray-900 mt-2">
                          📅 {data.startDate ? new Date(data.startDate).toLocaleDateString('id-ID') : '-'}
                          {data.endDate ? ` - ${new Date(data.endDate).toLocaleDateString('id-ID')}` : ' - Sekarang'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {selectedRequest.type === 'EDUCATION' && (
                <div>
                  <h4 className="font-bold mb-2">Pendidikan Baru:</h4>
                  {(() => {
                    const data = JSON.parse(selectedRequest.newData);
                    return (
                      <div className="bg-gray-50 border rounded p-4">
                        <p className="font-semibold text-lg">{data.degree}</p>
                        <p className="text-gray-900">{data.institution}</p>
                        {data.major && <p className="text-gray-900">Jurusan: {data.major}</p>}
                        <p className="text-sm text-gray-900 mt-2">
                          📅 {data.startYear} - {data.endYear || 'Sekarang'}
                        </p>
                        {data.gpa && <p className="text-sm text-gray-900">IPK: {data.gpa}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tolak perubahan ini?')) {
                      const note = prompt('Alasan penolakan:');
                      if (note) {
                        handleApproveReject(selectedRequest.id, 'REJECTED', note);
                        setSelectedRequest(null);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ✗ Tolak
                </button>
                <button
                  onClick={() => {
                    if (confirm('Setujui perubahan ini?')) {
                      handleApproveReject(selectedRequest.id, 'APPROVED');
                      setSelectedRequest(null);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✓ Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Job Position Modal */}
      {showAddJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingJobPosition ? 'Edit Jabatan' : 'Tambah Jabatan Baru'}
              </h3>
              <button
                onClick={() => {
                  setShowAddJobForm(false);
                  setEditingJobPosition(null);
                }}
                className="text-gray-800 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-bold text-lg mb-4">Informasi Dasar</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Jabatan *</label>
                    <input
                      type="text"
                      value={jobFormData.title}
                      onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Contoh: Analis Keamanan Siber"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Unit/Direktorat *</label>
                    <input
                      type="text"
                      value={jobFormData.unit}
                      onChange={(e) => setJobFormData({ ...jobFormData, unit: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Contoh: Direktorat Keamanan Siber"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Level Jabatan *</label>
                    <select
                      value={jobFormData.level}
                      onChange={(e) => setJobFormData({ ...jobFormData, level: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">-- Pilih Level --</option>
                      <option value="Staff">Staff</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Expert">Expert</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status Ketersediaan</label>
                    <select
                      value={jobFormData.isAvailable ? 'true' : 'false'}
                      onChange={(e) => setJobFormData({ ...jobFormData, isAvailable: e.target.value === 'true' })}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="true">Tersedia (Aktif)</option>
                      <option value="false">Tidak Tersedia (Nonaktif)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Deskripsi Jabatan</label>
                    <textarea
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Deskripsi singkat tentang jabatan ini..."
                    />
                  </div>
                </div>
              </div>

              {/* Competencies */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">Kompetensi yang Dibutuhkan</h4>
                  <button
                    onClick={addCompetencyToJob}
                    disabled={competencies.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    + Tambah Kompetensi
                  </button>
                </div>

                {jobFormData.competencies.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed">
                    <p className="text-gray-800 mb-2">Belum ada kompetensi yang ditambahkan</p>
                    <p className="text-sm text-gray-400">Klik tombol "Tambah Kompetensi" untuk menambahkan</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobFormData.competencies.map((comp, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5">
                            <label className="block text-xs font-medium mb-1">Kompetensi</label>
                            <select
                              value={comp.competencyId}
                              onChange={(e) => updateJobCompetency(index, 'competencyId', e.target.value)}
                              className="w-full border rounded px-2 py-1.5 text-sm"
                            >
                              {competencies.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.category})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium mb-1">Level Minimal</label>
                            <select
                              value={comp.requiredLevel}
                              onChange={(e) => updateJobCompetency(index, 'requiredLevel', parseInt(e.target.value))}
                              className="w-full border rounded px-2 py-1.5 text-sm"
                            >
                              <option value="1">Level 1 - Basic</option>
                              <option value="2">Level 2 - Intermediate</option>
                              <option value="3">Level 3 - Advanced</option>
                              <option value="4">Level 4 - Expert</option>
                              <option value="5">Level 5 - Master</option>
                            </select>
                          </div>
                          <div className="col-span-3">
                            <label className="block text-xs font-medium mb-1">Prioritas</label>
                            <select
                              value={comp.priority}
                              onChange={(e) => updateJobCompetency(index, 'priority', e.target.value)}
                              className="w-full border rounded px-2 py-1.5 text-sm"
                            >
                              <option value="HIGH">High</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="LOW">Low</option>
                            </select>
                          </div>
                          <div className="col-span-1 flex items-end">
                            <button
                              onClick={() => removeCompetencyFromJob(index)}
                              className="w-full bg-red-500 text-white px-2 py-1.5 rounded hover:bg-red-600 text-sm"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowAddJobForm(false);
                    setEditingJobPosition(null);
                  }}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveJobPosition}
                  disabled={!jobFormData.title || !jobFormData.unit || !jobFormData.level}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingJobPosition ? 'Update Jabatan' : 'Simpan Jabatan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
