 'use client';

import { useEffect, useState } from 'react';
import LearningPath from './LearningPath';
import Chatbot from './Chatbot';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';

interface PegawaiDashboardProps {
  session: Session;
}

export default function PegawaiDashboard({ session }: PegawaiDashboardProps) {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState('');
  const [editData, setEditData] = useState<any>({});
  const [jobPositions, setJobPositions] = useState<any[]>([]);
  const [analyzingMatches, setAnalyzingMatches] = useState(false);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [assessment, setAssessment] = useState<any>(null);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [loadedFromDB, setLoadedFromDB] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    fetchChangeRequests();
    if (activeTab === 'analysis') {
      fetchJobPositions();
    }
    if (activeTab === 'penilaian' && employee && !loadedFromDB) {
      fetchAssessment();
    }
  }, [activeTab, employee]);

  useEffect(() => {
    if (employee && !loadedFromDB) {
      fetchAssessment();
    }
  }, [employee]);

  const fetchAssessment = async () => {
    if (!employee?.id) return;
    
    try {
      const currentYear = new Date().getFullYear();
      const res = await fetch(`/api/assessments?employeeId=${employee.id}&year=${currentYear}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        // Load from database
        const dbAssessment = data[0];
        setAssessment({
          ...dbAssessment,
          rows: dbAssessment.assessmentItems || [],
          totalKinerja: dbAssessment.totalKinerja,
          totalPotensial: dbAssessment.totalPotensial,
          overall: dbAssessment.overallScore,
          boxNumber: dbAssessment.boxNumber,
          boxDescription: dbAssessment.boxDescription,
          recommendations: dbAssessment.recommendations ? JSON.parse(dbAssessment.recommendations) : [],
        });
        setLoadedFromDB(true);
      } else {
        // Generate dummy if no assessment exists
        const a = generateDummyAssessment(employee);
        setAssessment(a);
        setLoadedFromDB(false);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      // Fallback to dummy
      const a = generateDummyAssessment(employee);
      setAssessment(a);
      setLoadedFromDB(false);
    }
  };

  const saveAssessment = async () => {
    if (!assessment || !employee?.id) return;
    
    setSavingAssessment(true);
    try {
      const currentYear = new Date().getFullYear();
      const payload = {
        employeeId: employee.id,
        year: currentYear,
        period: 'Tahunan',
        totalKinerja: assessment.totalKinerja,
        totalPotensial: assessment.totalPotensial,
        overallScore: assessment.overall,
        boxNumber: assessment.boxNumber,
        boxDescription: assessment.boxDescription,
        recommendations: assessment.recommendations || [],
        assessmentItems: assessment.rows.map((row: any) => ({
          type: row.parameter.startsWith('Kinerja') ? 'KINERJA' : 'POTENSIAL',
          parameter: row.parameter,
          komponen: row.komponen,
          bobotKomponen: row.bobotKomponen,
          indikator: row.indikator,
          bobotIndikator: row.bobotIndikator,
          nilai: row.nilai,
          overallPct: row.overallPct,
          contribValue: row.contribValue,
        })),
      };

      const res = await fetch('/api/assessments', {
        method: loadedFromDB ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loadedFromDB ? { ...payload, id: assessment.id } : payload),
      });

      if (res.ok) {
        const saved = await res.json();
        alert('✅ Penilaian berhasil disimpan ke database!');
        setAssessment({
          ...saved,
          rows: saved.assessmentItems || [],
          totalKinerja: saved.totalKinerja,
          totalPotensial: saved.totalPotensial,
          overall: saved.overallScore,
          boxNumber: saved.boxNumber,
          boxDescription: saved.boxDescription,
          recommendations: saved.recommendations ? JSON.parse(saved.recommendations) : [],
        });
        setLoadedFromDB(true);
      } else {
        const error = await res.json();
        alert(`❌ Gagal menyimpan: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('❌ Terjadi kesalahan saat menyimpan penilaian');
    } finally {
      setSavingAssessment(false);
    }
  };

  const fetchEmployeeData = async () => {
    try {
      const res = await fetch(`/api/employees?id=${session.user.employeeId}`);
      const data = await res.json();
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    try {
      const res = await fetch('/api/change-requests');
      const data = await res.json();
      setChangeRequests(data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
    }
  };

  const fetchJobPositions = async () => {
    try {
      const res = await fetch('/api/job-positions?available=true');
      const data = await res.json();
      setJobPositions(data);
    } catch (error) {
      console.error('Error fetching job positions:', error);
    }
  };

  const generateDummyAssessment = (emp: any) => {
    // Fixed dummy values for now (can be replaced with seeded random later)
    const indicators = {
      // Kinerja (Sumbu Y)
      penilaianKinerja: 75,
      penghargaan: 60,
      penugasanTim: 70,
      umpanBalik360: 65,
      // Potensial (Sumbu X)
      penilaianKompetensi: 72,
      pengembanganKompetensi: 68,
      pengalamanJabatan: 66,
      penilaianPotensi: 70,
      tingkatPendidikan: 85,
      kesesuaianBidang: 78,
      verifikasiDisiplin: 90,
    };

    // Weights (percent values)
    const weights = {
      kinerja: 60, // component weight
      kinerja_penguat: 40,
      // indicators inside Kinerja
      penilaianKinerja: 60,
      penghargaan: 15,
      penugasanTim: 15,
      umpanBalik360: 10,

      kompetensi: 40,
      penilaianKompetensi: 20,
      pengembanganKompetensi: 10,
      pengalamanJabatan: 10,

      potensi: 25,
      penilaianPotensi: 25,

      kualifikasi: 20,
      tingkatPendidikan: 10,
      kesesuaianBidang: 10,

      integritas: 15,
      verifikasiDisiplin: 15,
    };

    // Helper to compute contribution: compWeight * indicatorWeight (%) -> overall %
    const contribution = (compW: number, indW: number, score: number) => {
      const overallPct = (compW * indW) / 100; // e.g., 60 * 60 = 36
      return { overallPct, value: score, contribValue: (overallPct * score) / 100 };
    };

    // Build rows
    const rows: any[] = [];

    // Kinerja Utama
    rows.push({
      parameter: 'Kinerja (Sumbu Y)',
      komponen: 'Kinerja Utama',
      bobotKomponen: weights.kinerja,
      indikator: 'Penilaian Kinerja',
      bobotIndikator: weights.penilaianKinerja,
      nilai: indicators.penilaianKinerja,
      ...contribution(weights.kinerja, weights.penilaianKinerja, indicators.penilaianKinerja),
    });

    // Kinerja Penguat - 3 indicators
    rows.push({
      parameter: 'Kinerja (Sumbu Y)',
      komponen: 'Kinerja Penguat',
      bobotKomponen: weights.kinerja_penguat,
      indikator: 'Penghargaan',
      bobotIndikator: weights.penghargaan,
      nilai: indicators.penghargaan,
      ...contribution(weights.kinerja_penguat, weights.penghargaan, indicators.penghargaan),
    });
    rows.push({
      parameter: 'Kinerja (Sumbu Y)',
      komponen: 'Kinerja Penguat',
      bobotKomponen: weights.kinerja_penguat,
      indikator: 'Penugasan dalam Tim Kerja',
      bobotIndikator: weights.penugasanTim,
      nilai: indicators.penugasanTim,
      ...contribution(weights.kinerja_penguat, weights.penugasanTim, indicators.penugasanTim),
    });
    rows.push({
      parameter: 'Kinerja (Sumbu Y)',
      komponen: 'Kinerja Penguat',
      bobotKomponen: weights.kinerja_penguat,
      indikator: 'Umpan Balik Kinerja 360 derajat',
      bobotIndikator: weights.umpanBalik360,
      nilai: indicators.umpanBalik360,
      ...contribution(weights.kinerja_penguat, weights.umpanBalik360, indicators.umpanBalik360),
    });

    // Potensial - Kompetensi (3 indicators)
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Kompetensi',
      bobotKomponen: weights.kompetensi,
      indikator: 'Penilaian Kompetensi',
      bobotIndikator: weights.penilaianKompetensi,
      nilai: indicators.penilaianKompetensi,
      ...contribution(weights.kompetensi, weights.penilaianKompetensi, indicators.penilaianKompetensi),
    });
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Kompetensi',
      bobotKomponen: weights.kompetensi,
      indikator: 'Pengembangan Kompetensi',
      bobotIndikator: weights.pengembanganKompetensi,
      nilai: indicators.pengembanganKompetensi,
      ...contribution(weights.kompetensi, weights.pengembanganKompetensi, indicators.pengembanganKompetensi),
    });
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Kompetensi',
      bobotKomponen: weights.kompetensi,
      indikator: 'Pengalaman Jabatan',
      bobotIndikator: weights.pengalamanJabatan,
      nilai: indicators.pengalamanJabatan,
      ...contribution(weights.kompetensi, weights.pengalamanJabatan, indicators.pengalamanJabatan),
    });

    // Potensi
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Potensi',
      bobotKomponen: weights.potensi,
      indikator: 'Penilaian Potensi',
      bobotIndikator: weights.penilaianPotensi,
      nilai: indicators.penilaianPotensi,
      ...contribution(weights.potensi, weights.penilaianPotensi, indicators.penilaianPotensi),
    });

    // Kualifikasi (2 indicators)
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Kualifikasi',
      bobotKomponen: weights.kualifikasi,
      indikator: 'Tingkat Pendidikan Formal',
      bobotIndikator: weights.tingkatPendidikan,
      nilai: indicators.tingkatPendidikan,
      ...contribution(weights.kualifikasi, weights.tingkatPendidikan, indicators.tingkatPendidikan),
    });
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Kualifikasi',
      bobotKomponen: weights.kualifikasi,
      indikator: 'Kesesuaian Bidang Ilmu',
      bobotIndikator: weights.kesesuaianBidang,
      nilai: indicators.kesesuaianBidang,
      ...contribution(weights.kualifikasi, weights.kesesuaianBidang, indicators.kesesuaianBidang),
    });

    // Integritas & Moralitas
    rows.push({
      parameter: 'Potensial (Sumbu X)',
      komponen: 'Integritas & Moralitas',
      bobotKomponen: weights.integritas,
      indikator: 'Verifikasi Rekam Jejak Disiplin',
      bobotIndikator: weights.verifikasiDisiplin,
      nilai: indicators.verifikasiDisiplin,
      ...contribution(weights.integritas, weights.verifikasiDisiplin, indicators.verifikasiDisiplin),
    });

    // Totals per major axis
    const totalKinerja = rows
      .filter(r => r.parameter.startsWith('Kinerja'))
      .reduce((s: number, r: any) => s + r.contribValue, 0);
    const totalPotensial = rows
      .filter(r => r.parameter.startsWith('Potensial'))
      .reduce((s: number, r: any) => s + r.contribValue, 0);

    const overall = totalKinerja + totalPotensial; // should be out of 100

    return { rows, totals: { totalKinerja: parseFloat(totalKinerja.toFixed(2)), totalPotensial: parseFloat(totalPotensial.toFixed(2)), overall: parseFloat(overall.toFixed(2)) } };
  };

  const handleAnalyzeMatches = async () => {
    if (!employee) return;
    
    setAnalyzingMatches(true);
    setMatchResults([]);

    try {
      // Analyze against all available job positions
      const analysisPromises = jobPositions.map(async (job) => {
        try {
          const res = await fetch('/api/job-match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: employee.id,
              jobPositionId: job.id,
            }),
          });
          
          if (!res.ok) {
            console.error(`Failed to analyze ${job.title}:`, res.status);
            return {
              jobPosition: job,
              analysis: {
                matchScore: 0,
                summary: 'Gagal melakukan analisis',
                strengths: [],
                gaps: [],
                recommendation: 'Silakan coba lagi nanti',
              },
            };
          }
          
          const data = await res.json();
          console.log('Analysis result for', job.title, ':', data);
          
          // Extract the actual analysis data
          // API returns: { matchScore, summary, strengths, gaps, recommendation, jobMatch, note? }
          return {
            jobPosition: job,
            analysis: {
              matchScore: data.matchScore || 0,
              summary: data.summary || 'Tidak ada ringkasan',
              strengths: data.strengths || [],
              gaps: data.gaps || [],
              recommendation: data.recommendation || 'Tidak ada rekomendasi',
              note: data.note || null,
            },
          };
        } catch (error) {
          console.error(`Error analyzing ${job.title}:`, error);
          return {
            jobPosition: job,
            analysis: {
              matchScore: 0,
              summary: 'Terjadi kesalahan saat analisis',
              strengths: [],
              gaps: [],
              recommendation: 'Silakan coba lagi nanti',
            },
          };
        }
      });

      const results = await Promise.all(analysisPromises);
      
      // Sort by match score (highest first)
      const sortedResults = results.sort((a, b) => 
        (b.analysis.matchScore || 0) - (a.analysis.matchScore || 0)
      );

      console.log('All analysis results:', sortedResults);
      setMatchResults(sortedResults);
    } catch (error) {
      console.error('Error analyzing matches:', error);
      alert('Gagal melakukan analisis');
    } finally {
      setAnalyzingMatches(false);
    }
  };

  const handleEditRequest = async (type: string, data: any) => {
    try {
      // Prepare data based on type
      let newData = { ...data };
      let reason = data.reason || 'Penambahan/perubahan data';
      
      // Remove reason from newData if it exists
      if (newData.reason) {
        delete newData.reason;
      }

      // For PROFILE changes, send only changed fields
      let oldData = null;
      if (type === 'PROFILE') {
        oldData = {
          fullName: employee.fullName,
          birthPlace: employee.birthPlace,
          birthDate: employee.birthDate,
          gender: employee.gender,
          phone: employee.phone,
          email: employee.email,
          address: employee.address,
        };
      }

      const res = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          newData,
          oldData,
          reason,
        }),
      });

      if (res.ok) {
        alert('Pengajuan berhasil dikirim dan menunggu persetujuan OSDM');
        setShowEditModal(false);
        setEditData({});
        fetchChangeRequests();
        
        // Refresh employee data after submission
        setTimeout(() => {
          fetchEmployeeData();
        }, 500);
      } else {
        const error = await res.json();
        alert(`Gagal mengajukan: ${error.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error('Error submitting change request:', error);
      alert('Gagal mengajukan perubahan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-card border-b-2 border-yellow-400/30">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard Pegawai</h1>
              <p className="text-sm text-blue-700 font-semibold">{session.user.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="modern-button bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Modern Tabs with Glassmorphism */}
        <div className="glass-card rounded-2xl shadow-modern-lg mb-8 overflow-hidden border-2 border-white/50 fade-in-up">
          <div className="flex border-b-2 border-blue-200/30 bg-gradient-to-r from-yellow-50/50 to-blue-50/50 overflow-x-auto backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'profile'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'profile' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              👤 Profil
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'certifications'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'certifications' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              📜 Sertifikasi
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'assignments'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'assignments' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              📋 Penugasan
            </button>
            <button
              onClick={() => setActiveTab('positions')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'positions'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'positions' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              💼 Riwayat Jabatan
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'education'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'education' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              🎓 Pendidikan
            </button>
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'changes'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'changes' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              📝 Pengajuan Perubahan
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'analysis'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'analysis' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              🤖 Analisis Jabatan
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
                activeTab === 'assessment'
                  ? 'text-blue-700 bg-white/90 shadow-lg'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
              }`}
            >
              {activeTab === 'assessment' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full"></div>
              )}
              📊 Penilaian
            </button>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && employee && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Data Diri</h2>
                  <button
                    onClick={() => {
                      setEditType('PROFILE');
                      setEditData(employee);
                      setShowEditModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition font-semibold"
                  >
                    Ajukan Perubahan
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-900">NIP</label>
                    <p className="font-medium">{employee.nip}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Nama Lengkap</label>
                    <p className="font-medium">{employee.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Tempat Lahir</label>
                    <p className="font-medium">{employee.birthPlace || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Tanggal Lahir</label>
                    <p className="font-medium">
                      {employee.birthDate
                        ? new Date(employee.birthDate).toLocaleDateString('id-ID')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Jenis Kelamin</label>
                    <p className="font-medium">{employee.gender || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Golongan</label>
                    <p className="font-medium">{employee.golongan || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Jabatan Saat Ini</label>
                    <p className="font-medium">{employee.currentPosition || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Unit</label>
                    <p className="font-medium">{employee.unit || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-900">Alamat</label>
                    <p className="font-medium">{employee.address || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Telepon</label>
                    <p className="font-medium">{employee.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Email</label>
                    <p className="font-medium">{employee.email || '-'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Sertifikasi</h2>
                  <button
                    onClick={() => {
                      setEditType('CERTIFICATION');
                      setEditData({});
                      setShowEditModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition font-semibold"
                  >
                    Tambah Sertifikasi
                  </button>
                </div>

                <div className="space-y-4">
                  {employee?.certifications?.map((cert: any) => (
                    <div key={cert.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg">{cert.name}</h3>
                      <p className="text-gray-900">Penerbit: {cert.issuer}</p>
                      <p className="text-sm text-gray-800">
                        Tanggal: {new Date(cert.issueDate).toLocaleDateString('id-ID')}
                        {cert.expiryDate &&
                          ` - ${new Date(cert.expiryDate).toLocaleDateString('id-ID')}`}
                      </p>
                      {cert.credential && (
                        <p className="text-sm text-gray-800">Kredensial: {cert.credential}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Penugasan</h2>
                  <button
                    onClick={() => {
                      setEditType('ASSIGNMENT');
                      setEditData({});
                      setShowEditModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition font-semibold"
                  >
                    Tambah Penugasan
                  </button>
                </div>

                <div className="space-y-4">
                  {employee?.assignments?.map((assignment: any) => (
                    <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg">{assignment.title}</h3>
                      <p className="text-gray-900">{assignment.description}</p>
                      <p className="text-sm text-gray-800">
                        {new Date(assignment.startDate).toLocaleDateString('id-ID')}
                        {assignment.endDate
                          ? ` - ${new Date(assignment.endDate).toLocaleDateString('id-ID')}`
                          : ' - Sekarang'}
                      </p>
                      {assignment.location && (
                        <p className="text-sm text-gray-800">Lokasi: {assignment.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Position Histories Tab */}
            {activeTab === 'positions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Riwayat Jabatan</h2>
                  <button
                    onClick={() => {
                      setEditType('POSITION_HISTORY');
                      setEditData({});
                      setShowEditModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition font-semibold"
                  >
                    Tambah Riwayat Jabatan
                  </button>
                </div>

                <div className="space-y-4">
                  {employee?.positionHistories?.map((position: any) => (
                    <div key={position.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg">{position.position}</h3>
                      <p className="text-gray-900">{position.unit}</p>
                      <p className="text-sm text-gray-800">
                        {new Date(position.startDate).toLocaleDateString('id-ID')}
                        {position.endDate
                          ? ` - ${new Date(position.endDate).toLocaleDateString('id-ID')}`
                          : ' - Sekarang'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Riwayat Pendidikan</h2>
                  <button
                    onClick={() => {
                      setEditType('EDUCATION');
                      setEditData({});
                      setShowEditModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition font-semibold"
                  >
                    Tambah Pendidikan
                  </button>
                </div>

                <div className="space-y-4">
                  {employee?.educationHistories?.map((edu: any) => (
                    <div key={edu.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h3 className="font-bold text-lg">{edu.degree}</h3>
                      <p className="text-gray-900">{edu.institution}</p>
                      {edu.major && <p className="text-gray-900">Jurusan: {edu.major}</p>}
                      <p className="text-sm text-gray-800">
                        {edu.startYear} - {edu.endYear || 'Sekarang'}
                      </p>
                      {edu.gpa && <p className="text-sm text-gray-800">IPK: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Change Requests Tab */}
            {activeTab === 'changes' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Pengajuan Perubahan Data</h2>

                <div className="space-y-4">
                  {changeRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className={`border rounded-lg p-4 ${
                        request.status === 'APPROVED'
                          ? 'bg-green-50 border-green-200'
                          : request.status === 'REJECTED'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">
                            {request.type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-gray-900">
                            Diajukan: {new Date(request.createdAt).toLocaleDateString('id-ID')}
                          </p>
                          {request.reviewedAt && (
                            <p className="text-sm text-gray-900">
                              Ditinjau: {new Date(request.reviewedAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                          {request.reviewNote && (
                            <p className="text-sm text-gray-900 mt-2">
                              Catatan: {request.reviewNote}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            request.status === 'APPROVED'
                              ? 'bg-green-200 text-green-800'
                              : request.status === 'REJECTED'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {request.status === 'APPROVED'
                            ? 'Disetujui'
                            : request.status === 'REJECTED'
                            ? 'Ditolak'
                            : 'Menunggu'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {changeRequests.length === 0 && (
                    <p className="text-gray-800 text-center py-8">
                      Belum ada pengajuan perubahan
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Analisis Kesesuaian Jabatan</h2>

                {/* Introduction */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-blue-900 mb-2">
                        Temukan Jabatan yang Cocok untuk Anda
                      </h3>
                      <p className="text-gray-800 text-sm mb-4">
                        Sistem akan menganalisis profil Anda (sertifikasi, penugasan, riwayat jabatan, dan pendidikan) 
                        menggunakan AI untuk menemukan jabatan yang paling sesuai dengan kompetensi Anda.
                      </p>
                      <button
                        onClick={handleAnalyzeMatches}
                        disabled={analyzingMatches || jobPositions.length === 0}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
                      >
                        {analyzingMatches ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Menganalisis {jobPositions.length} jabatan...</span>
                          </>
                        ) : (
                          <>
                            <span>🤖</span>
                            <span>Mulai Analisis AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {analyzingMatches && (
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-800 font-medium">Sedang menganalisis profil Anda...</p>
                    <p className="text-sm text-gray-900 mt-2">Proses ini mungkin memakan waktu beberapa saat</p>
                  </div>
                )}

                {/* Results */}
                {!analyzingMatches && matchResults.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-900">Hasil Analisis Kesesuaian</h3>
                      <span className="text-sm text-gray-900">
                        {matchResults.length} jabatan dianalisis
                      </span>
                    </div>

                    <div className="space-y-4">
                      {matchResults.map((result, index) => {
                        const matchScore = result.analysis.matchScore || 0;
                        const strengths = Array.isArray(result.analysis.strengths) 
                          ? result.analysis.strengths 
                          : [];
                        const gaps = Array.isArray(result.analysis.gaps)
                          ? result.analysis.gaps
                          : [];

                        return (
                          <div 
                            key={result.jobPosition.id}
                            className={`border-2 rounded-lg p-5 transition-all ${
                              matchScore >= 80 ? 'border-green-300 bg-green-50 shadow-md' :
                              matchScore >= 60 ? 'border-yellow-300 bg-yellow-50 shadow-md' :
                              'border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4 flex-1">
                                {index < 3 && (
                                  <div className={`text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center ${
                                    index === 0 ? 'bg-yellow-400 text-white' :
                                    index === 1 ? 'bg-gray-300 text-white' :
                                    'bg-orange-400 text-white'
                                  }`}>
                                    #{index + 1}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-bold text-xl text-gray-900">{result.jobPosition.title}</h4>
                                  <p className="text-gray-800 font-medium">{result.jobPosition.unit}</p>
                                  <p className="text-sm text-gray-900">Level: {result.jobPosition.level}</p>
                                  {result.jobPosition.description && (
                                    <p className="text-sm text-gray-900 italic mt-1">{result.jobPosition.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-4xl font-bold ${
                                  matchScore >= 80 ? 'text-green-600' :
                                  matchScore >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {matchScore}%
                                </div>
                                <p className="text-sm text-gray-900 font-medium">Kesesuaian</p>
                              </div>
                            </div>

                            {/* Summary */}
                            {result.analysis.summary && (
                              <div className="mb-4 p-4 bg-white border-l-4 border-blue-400 rounded">
                                <p className="font-semibold text-sm text-blue-900 mb-1">💡 Analisis:</p>
                                <p className="text-sm text-gray-900">{result.analysis.summary}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {/* Strengths */}
                              <div className="bg-white border border-green-200 rounded-lg p-4">
                                <p className="font-bold text-green-700 mb-3 flex items-center">
                                  <span className="text-xl mr-2">✓</span> Kekuatan Anda ({strengths.length})
                                </p>
                                {strengths.length > 0 ? (
                                  <ul className="space-y-2">
                                    {strengths.map((strength: string, idx: number) => (
                                      <li key={idx} className="flex items-start text-sm">
                                        <span className="text-green-600 mr-2 mt-1">•</span>
                                        <span className="text-gray-800">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-900 italic">Tidak ada data kekuatan</p>
                                )}
                              </div>

                              {/* Gaps */}
                              <div className="bg-white border border-red-200 rounded-lg p-4">
                                <p className="font-bold text-red-700 mb-3 flex items-center">
                                  <span className="text-xl mr-2">⚠</span> Yang Perlu Ditingkatkan ({gaps.length})
                                </p>
                                {gaps.length > 0 ? (
                                  <ul className="space-y-2">
                                    {gaps.map((gap: string, idx: number) => (
                                      <li key={idx} className="flex items-start text-sm">
                                        <span className="text-red-600 mr-2 mt-1">•</span>
                                        <span className="text-gray-800">{gap}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-900 italic">Tidak ada gap yang teridentifikasi</p>
                                )}
                              </div>
                            </div>

                            {/* Recommendation */}
                            {result.analysis.recommendation && (
                              <div className="p-4 bg-purple-50 border-l-4 border-purple-400 rounded">
                                <p className="font-bold text-purple-900 mb-2 flex items-center">
                                  <span className="text-xl mr-2">📋</span> Rekomendasi:
                                </p>
                                <p className="text-sm text-gray-900">{result.analysis.recommendation}</p>
                              </div>
                            )}

                            {/* Match Level Indicator */}
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-800">
                                  {matchScore >= 80 ? '🌟 Sangat Cocok - Anda memenuhi sebagian besar kriteria' :
                                   matchScore >= 60 ? '👍 Cukup Cocok - Anda bisa mengembangkan kompetensi tertentu' :
                                   '💪 Perlu Pengembangan - Ada beberapa gap yang perlu ditutup'}
                                </span>
                                {!result.jobPosition.isAvailable && (
                                  <span className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-medium">
                                    Saat ini tidak tersedia
                                  </span>
                                )}
                              </div>
                              {result.analysis.note && (
                                <p className="text-xs text-blue-700 mt-2 italic font-medium">
                                  ℹ️ {result.analysis.note}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Statistics Summary */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {matchResults.filter(r => (r.analysis.matchScore || 0) >= 80).length}
                        </div>
                        <p className="text-sm text-gray-800 mt-1 font-medium">Sangat Cocok (≥80%)</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {matchResults.filter(r => {
                            const score = r.analysis.matchScore || 0;
                            return score >= 60 && score < 80;
                          }).length}
                        </div>
                        <p className="text-sm text-gray-800 mt-1 font-medium">Cukup Cocok (60-79%)</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                          {matchResults.filter(r => (r.analysis.matchScore || 0) < 60).length}
                        </div>
                        <p className="text-sm text-gray-800 mt-1 font-medium">Perlu Pengembangan (&lt;60%)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!analyzingMatches && matchResults.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-800 font-medium mb-2">Belum ada hasil analisis</p>
                    <p className="text-sm text-gray-900">Klik tombol "Mulai Analisis AI" di atas untuk memulai</p>
                  </div>
                )}
              </div>
            )}

            {/* Assessment Tab */}
            {activeTab === 'assessment' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Penilaian Kinerja & Potensial</h2>
                  {assessment && (
                    <button
                      onClick={saveAssessment}
                      disabled={savingAssessment}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingAssessment ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Menyimpan...
                        </>
                      ) : loadedFromDB ? (
                        <>💾 Update Penilaian</>
                      ) : (
                        <>💾 Simpan ke Database</>
                      )}
                    </button>
                  )}
                </div>

                {loadedFromDB && assessment && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <p className="text-sm text-green-800">
                      ✅ <strong>Data dari Database</strong> — Penilaian tahun {assessment.year || new Date().getFullYear()} 
                      {assessment.createdAt && ` (Terakhir update: ${new Date(assessment.updatedAt || assessment.createdAt).toLocaleDateString('id-ID')})`}
                    </p>
                  </div>
                )}

                {!assessment && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-900 font-medium mb-2">Penilaian belum tersedia</p>
                    <p className="text-sm text-gray-800">Assessment akan dihasilkan otomatis saat data pegawai dimuat.</p>
                  </div>
                )}

                {assessment && (
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sumbu Y - Kinerja */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-bold text-lg text-green-800 mb-3">Sumbu Y — Kinerja</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-gray-900">
                            <thead>
                              <tr className="text-left text-xs text-gray-800 border-b">
                                <th className="py-2 px-3">Komponen</th>
                                <th className="py-2 px-3">Indikator</th>
                                <th className="py-2 px-3">Bobot Komponen (%)</th>
                                <th className="py-2 px-3">Bobot Indikator (%)</th>
                                <th className="py-2 px-3">Nilai</th>
                                <th className="py-2 px-3">Kontribusi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assessment.rows
                                .filter((r: any) => String(r.parameter).startsWith('Kinerja'))
                                .map((row: any, idx: number) => (
                                  <tr key={idx} className="border-b last:border-b-0">
                                    <td className="py-2 px-3 align-top">{row.komponen}</td>
                                    <td className="py-2 px-3 align-top">{row.indikator}</td>
                                    <td className="py-2 px-3 align-top">{row.bobotKomponen}%</td>
                                    <td className="py-2 px-3 align-top">{row.bobotIndikator}%</td>
                                    <td className="py-2 px-3 align-top">{row.nilai}</td>
                                    <td className="py-2 px-3 align-top font-medium">{(row.contribValue || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t">
                                <td colSpan={4} className="py-3 px-3 font-bold text-gray-800">Total Kinerja</td>
                                <td className="py-3 px-3 font-medium" />
                                <td className="py-3 px-3 font-bold text-green-700">{assessment.totals?.totalKinerja}%</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Sumbu X - Potensial */}
                      <div className="border rounded-lg p-4">
                        <h3 className="font-bold text-lg text-blue-800 mb-3">Sumbu X — Potensial</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm text-gray-900">
                            <thead>
                              <tr className="text-left text-xs text-gray-800 border-b">
                                <th className="py-2 px-3">Komponen</th>
                                <th className="py-2 px-3">Indikator</th>
                                <th className="py-2 px-3">Bobot Komponen (%)</th>
                                <th className="py-2 px-3">Bobot Indikator (%)</th>
                                <th className="py-2 px-3">Nilai</th>
                                <th className="py-2 px-3">Kontribusi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assessment.rows
                                .filter((r: any) => String(r.parameter).startsWith('Potensial'))
                                .map((row: any, idx: number) => (
                                  <tr key={idx} className="border-b last:border-b-0">
                                    <td className="py-2 px-3 align-top">{row.komponen}</td>
                                    <td className="py-2 px-3 align-top">{row.indikator}</td>
                                    <td className="py-2 px-3 align-top">{row.bobotKomponen}%</td>
                                    <td className="py-2 px-3 align-top">{row.bobotIndikator}%</td>
                                    <td className="py-2 px-3 align-top">{row.nilai}</td>
                                    <td className="py-2 px-3 align-top font-medium">{(row.contribValue || 0).toFixed(2)}</td>
                                  </tr>
                                ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t">
                                <td colSpan={4} className="py-3 px-3 font-bold text-gray-800">Total Potensial</td>
                                <td className="py-3 px-3 font-medium" />
                                <td className="py-3 px-3 font-bold text-blue-700">{assessment.totals?.totalPotensial}%</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Overall summary row */}
                    <div className="mt-4 flex items-center justify-end gap-6">
                      <div className="text-sm text-gray-900">Skor Keseluruhan:</div>
                      <div className="text-lg font-bold text-indigo-700">{assessment.totals?.overall}%</div>
                    </div>
                    {/* 9-box Talent Matrix */}
                    <div className="mt-6">
                      {(() => {
                        const kScore = assessment.totals?.totalKinerja ?? 0; // Kinerja (Y)
                        const pScore = assessment.totals?.totalPotensial ?? 0; // Potensial (X)

                        // Determine levels: 0 = Rendah, 1 = Menengah, 2 = Tinggi
                        const levelOf = (score: number) => (score >= 80 ? 2 : score >= 60 ? 1 : 0);

                        const potLevel = levelOf(pScore); // row index (Potensi)
                        const perfLevel = levelOf(kScore); // column index (Kinerja)

                        // 9-box matrix mapping (CORRECTED):
                        // Sumbu Y (Potensi): Low (bottom) -> High (top)
                        // Sumbu X (Kinerja): Low (left) -> High (right)
                        // 
                        // Visual representation:
                        //        Kinerja →
                        //      Low  Mid  High
                        // P  High [6] [8] [9]
                        // o  Mid  [3] [5] [7]
                        // t  Low  [1] [2] [4]
                        // ↑
                        //
                        // Array index mapping (potLevel from levelOf gives 0=Low, 1=Mid, 2=High):
                        // We need to FLIP the Potensi index so Low Potensi = bottom row visually
                        const matrix = [
                          [6, 8, 9],  // potLevel=2 (High Potensi) -> top row visually
                          [3, 5, 7],  // potLevel=1 (Mid Potensi)  -> middle row
                          [1, 2, 4],  // potLevel=0 (Low Potensi)  -> bottom row visually (KOTAK 1 di pojok kiri bawah)
                        ];

                        const boxNum = matrix[2 - potLevel]?.[perfLevel] ?? 5;
                        // Note: we use (2 - potLevel) to flip the Y-axis
                        // potLevel=0 (Low) -> matrix[2] -> [1,2,4]
                        // potLevel=1 (Mid) -> matrix[1] -> [3,5,7]
                        // potLevel=2 (High)-> matrix[0] -> [6,8,9]

                        const descriptions: Record<number, { title: string; text: string }> = {
                          1: {
                            title: 'Kotak 1 (Potensi rendah / Kinerja di bawah ekspektasi)',
                            text: 'Individu yang saat ini belum menunjukkan kinerja yang diharapkan dan juga tidak memiliki indikasi potensi besar untuk berkembang ke level yang lebih tinggi. Kategori ini perlu perhatian serius: apakah salah penempatan, kurang dukungan, atau sebaiknya dipertimbangkan peran lain atau pemisahan.',
                          },
                          2: {
                            title: 'Kotak 2 (Potensi rendah / Kinerja sesuai ekspektasi)',
                            text: 'Individu yang “cukup” melakukan tugasnya sesuai ekspektasi namun tidak menunjukkan potensi yang kuat untuk naik ke peran yang lebih kompleks. Mereka mungkin tetap sangat bernilai sebagai “kontributor stabil” di posisi saat ini, namun bukan calon pimpinan jangka panjang.',
                          },
                          3: {
                            title: 'Kotak 3 (Potensi menengah / Kinerja di bawah ekspektasi)',
                            text: 'Individu yang punya potensi yang cukup baik, namun saat ini belum memenuhi ekspektasi kinerja. Mungkin karena belum mendapatkan pelatihan yang cukup, role kurang cocok, atau ada hambatan lainnya. Perlu pengembangan, mentoring, atau pindah posisi agar potensi itu terwujud.',
                          },
                          4: {
                            title: 'Kotak 4 (Potensi rendah / Kinerja di atas ekspektasi)',
                            text: 'Individu yang performanya sangat baik di posisi sekarang, tetapi untuk berbagai alasan (kemungkinan kompetensi kepemimpinan, keinginan naik, atau faktor lainnya) tidak menunjukkan potensi besar untuk naik ke peran yang lebih besar. Strateginya: beri penghargaan, coba jalur spesialisasi atau peran mendukung, bukan promosi besar-besaran.',
                          },
                          5: {
                            title: 'Kotak 5 (Potensi menengah / Kinerja sesuai ekspektasi)',
                            text: 'Individu yang melakukan pekerjaannya dengan baik dan memiliki potensi untuk berkembang lebih jauh jika diberi kesempatan. Strategi pengembangan moderat: stretch assignment, pelatihan kepemimpinan, penguatan kompetensi agar naik ke tingkat berikutnya.',
                          },
                          6: {
                            title: 'Kotak 6 (Potensi tinggi / Kinerja di bawah ekspektasi)',
                            text: 'Kelompok yang menarik: potensi besar tetapi kinerjanya belum memuaskan. Mungkin karena sudah berada di posisi yang salah, kurang motivasi, atau transisi baru. Strategi: evaluasi penyebab rendahnya kinerja, beri coaching/mentoring, mungkin perlu role shift agar bisa “bebas” menunjukkan potensi itu.',
                          },
                          7: {
                            title: 'Kotak 7 (Potensi menengah / Kinerja di atas ekspektasi)',
                            text: 'Individu yang unggul di pekerjaan sekarang dan menunjukkan potensi yang cukup baik. Mereka bisa ditargetkan untuk naik ke level lebih tinggi dalam waktu menengah. Perlu pengembangan yang lebih agresif dibanding kotak 5.',
                          },
                          8: {
                            title: 'Kotak 8 (Potensi tinggi / Kinerja sesuai ekspektasi)',
                            text: 'Individu yang kinerjanya bagus sesuai ekspektasi sekarang dan memiliki potensi tinggi untuk naik ke level lebih besar. Ini adalah jalur utama untuk pengembangan, suksesi, dan pelatihan kepemimpinan. Organisasi harus menyiapkan jalur karier dan proyek-pengalaman yang memacu.',
                          },
                          9: {
                            title: 'Kotak 9 (Potensi tinggi / Kinerja di atas ekspektasi)',
                            text: '“Bintang” atau “top talent” – kinerja tinggi, potensi tinggi. Kandidat utama untuk promosi, tanggung-jawab lebih besar, dan peran strategis di masa depan. Organisasi harus “fast track” mereka, dengan program akselerasi, mentoring senior, tugas-strategis, suksesi.',
                          },
                        };

                        // Recommendations per box (user-provided)
                        const recommendations: Record<number, string[]> = {
                          9: [
                            'Dipromosikan dan dipertahankan',
                            'Masuk Kelompok Rencana Suksesi Instansi/Nasional',
                            'Penghargaan',
                          ],
                          8: [
                            'Dipertahankan',
                            'Masuk Kelompok Rencana Suksesi Instansi',
                            'Rotasi/Perluasan jabatan',
                            'Bimbingan kinerja',
                          ],
                          7: [
                            'Dipertahankan',
                            'Masuk Kelompok Rencana Suksesi Instansi',
                            'Rotasi/Pengayaan jabatan',
                            'Pengembangan kompetensi',
                            'Tugas belajar',
                          ],
                          6: [
                            'Penempatan yang sesuai',
                            'Bimbingan kinerja',
                            'Konseling kinerja',
                          ],
                          5: [
                            'Penempatan yang sesuai',
                            'Bimbingan kinerja',
                            'Pengembangan kompetensi',
                          ],
                          4: [
                            'Rotasi',
                            'Pengembangan kompetensi',
                          ],
                          3: [
                            'Bimbingan kinerja',
                            'Konseling kinerja',
                            'Pengembangan kompetensi',
                            'Penempatan yang sesuai',
                          ],
                          2: [
                            'Bimbingan kinerja',
                            'Pengembangan kompetensi',
                            'Penempatan yang sesuai',
                          ],
                          1: [
                            'Diproses sesuai ketentuan peraturan perundangan',
                          ],
                        };

                        // Map recommendation to suggested learning modules (simple defaults)
                        const recToLearning: Record<string, string[]> = {
                          'Dipromosikan dan dipertahankan': ['Leadership Acceleration Program', 'Strategic Project Assignment'],
                          'Masuk Kelompok Rencana Suksesi Instansi/Nasional': ['Succession Readiness Workshop', 'Executive Mentoring'],
                          'Penghargaan': ['Recognition & Rewards Program'],
                          'Dipertahankan': ['On-the-job stretch assignments', 'Continuous performance coaching'],
                          'Rotasi/Perluasan jabatan': ['Rotational Assignment Program', 'Cross-functional Training'],
                          'Bimbingan kinerja': ['Performance Coaching Sessions', 'SMART Goal Setting Course'],
                          'Rotasi/Pengayaan jabatan': ['Role Enrichment Projects', 'Specialist Track Training'],
                          'Tugas belajar': ['Formal Education Support (S2/Sertifikasi)'],
                          'Penempatan yang sesuai': ['Role-fit Assessment & Realignment'],
                          'Konseling kinerja': ['Employee Assistance & Counseling Program'],
                          'Pengembangan kompetensi': ['Technical Upskilling Courses', 'Leadership Fundamentals'],
                          'Diproses sesuai ketentuan peraturan perundangan': ['HR Review & Compliance Process'],
                        };

                        const activeRecs = recommendations[boxNum] || [];
                        // Build learning path by mapping recommendations to learning modules (unique)
                        const learningPath = Array.from(
                          new Set(
                            activeRecs.flatMap((r) => recToLearning[r] || [])
                          )
                        );
                        const activeDesc = descriptions[boxNum];

                        return (
                          <div>
                            <div className="mb-3 text-sm text-gray-800 font-medium">
                              Posisi 9-box berdasarkan Potensi (X) = <span className="font-bold">{pScore}%</span> dan Kinerja (Y) = <span className="font-bold">{kScore}%</span>
                            </div>

                            {/* Grid: rows = Potensi (Rendah -> Tinggi), cols = Kinerja (Di Bawah -> Sesuai -> Di Atas) */}
                            <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                              {/** We render rows Potensi 0..2, inside each row render cols Perf 0..2 **/}
                              {[0, 1, 2].map((pr) => (
                                // pr = potensi row
                                [0, 1, 2].map((pc) => {
                                  const num = matrix[pr][pc];
                                  const isActive = num === boxNum;
                                  return (
                                    <div
                                      key={`box-${pr}-${pc}`}
                                      className={`p-3 border rounded-lg flex flex-col items-start justify-center min-h-[72px] ${isActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
                                    >
                                      <div className="text-xs font-semibold">Kotak {num}</div>
                                      <div className="text-sm font-medium mt-1">{isActive ? activeDesc?.title : ''}</div>
                                    </div>
                                  );
                                })
                              ))}
                            </div>

                            <div className="mt-4">
                              <h4 className="text-lg font-bold text-gray-900">{activeDesc?.title}</h4>
                              <p className="text-sm text-gray-800 mt-2">{activeDesc?.text}</p>

                              {/* Recommendations */}
                              <div className="mt-4">
                                <h5 className="text-sm font-semibold text-gray-900">Rekomendasi Karier & Tindakan</h5>
                                {activeRecs.length > 0 ? (
                                  <ol className="list-decimal list-inside mt-2 text-sm text-gray-800 space-y-1">
                                    {activeRecs.map((r, i) => (
                                      <li key={i}>{r}</li>
                                    ))}
                                  </ol>
                                ) : (
                                  <p className="text-sm text-gray-900 mt-2">Tidak ada rekomendasi spesifik</p>
                                )}
                              </div>

                              {/* Suggested learning path */}
                              <div className="mt-4">
                                <h5 className="text-sm font-semibold text-gray-900">Learning Path yang Disarankan</h5>
                                {learningPath.length > 0 ? (
                                  <ul className="list-disc list-inside mt-2 text-sm text-gray-800 space-y-1">
                                    {learningPath.map((l, idx) => (
                                      <li key={idx}>{l}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-900 mt-2">Tidak ada modul pembelajaran yang direkomendasikan untuk kotak ini.</p>
                                )}
                                <p className="text-xs text-gray-900 mt-2">Disarankan menyelesaikan learning path ini untuk meningkatkan posisi Anda pada matriks 9-box.</p>
                              </div>

                              {/* Detailed, controllable learning path component */}
                              <div className="mt-4">
                                {employee?.id && (
                                  <LearningPath 
                                    employeeId={employee.id} 
                                    initialModules={learningPath}
                                    boxNumber={assessment?.boxNumber}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal with Forms */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-xl font-bold mb-4">
              {editType === 'PROFILE' ? 'Ajukan Perubahan Data Diri' :
               editType === 'CERTIFICATION' ? 'Tambah Sertifikasi' :
               editType === 'ASSIGNMENT' ? 'Tambah Penugasan' :
               editType === 'POSITION_HISTORY' ? 'Tambah Riwayat Jabatan' :
               'Tambah Pendidikan'}
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditRequest(editType, editData);
            }} className="space-y-4">
              
              {/* Profile Form */}
              {editType === 'PROFILE' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        required
                        value={editData.fullName || ''}
                        onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                      <input
                        type="text"
                        value={editData.birthPlace || ''}
                        onChange={(e) => setEditData({...editData, birthPlace: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={editData.birthDate ? new Date(editData.birthDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                      <select
                        value={editData.gender || ''}
                        onChange={(e) => setEditData({...editData, gender: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Telepon</label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat</label>
                    <textarea
                      value={editData.address || ''}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alasan Perubahan *</label>
                    <textarea
                      required
                      value={editData.reason || ''}
                      onChange={(e) => setEditData({...editData, reason: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={2}
                      placeholder="Jelaskan alasan perubahan data..."
                    />
                  </div>
                </>
              )}

              {/* Certification Form */}
              {editType === 'CERTIFICATION' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Sertifikasi *</label>
                    <input
                      type="text"
                      required
                      value={editData.name || ''}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., CISSP, CEH, CISA"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Penerbit *</label>
                      <input
                        type="text"
                        required
                        value={editData.issuer || ''}
                        onChange={(e) => setEditData({...editData, issuer: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., ISC2, EC-Council"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nomor Kredensial</label>
                      <input
                        type="text"
                        value={editData.credential || ''}
                        onChange={(e) => setEditData({...editData, credential: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Terbit *</label>
                      <input
                        type="date"
                        required
                        value={editData.issueDate || ''}
                        onChange={(e) => setEditData({...editData, issueDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Kadaluarsa</label>
                      <input
                        type="date"
                        value={editData.expiryDate || ''}
                        onChange={(e) => setEditData({...editData, expiryDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Deskripsi sertifikasi..."
                    />
                  </div>
                </>
              )}

              {/* Assignment Form */}
              {editType === 'ASSIGNMENT' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Judul Penugasan *</label>
                    <input
                      type="text"
                      required
                      value={editData.title || ''}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      placeholder="e.g., Tim Respons Insiden, Proyek Keamanan Nasional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi *</label>
                    <textarea
                      required
                      value={editData.description || ''}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="Jelaskan detail penugasan..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Lokasi</label>
                      <input
                        type="text"
                        value={editData.location || ''}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Jakarta, Regional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                      <input
                        type="date"
                        required
                        value={editData.startDate || ''}
                        onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={editData.endDate || ''}
                        onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                      <p className="text-xs text-gray-800 mt-1">Kosongkan jika masih berjalan</p>
                    </div>
                  </div>
                </>
              )}

              {/* Position History Form */}
              {editType === 'POSITION_HISTORY' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Jabatan *</label>
                      <input
                        type="text"
                        required
                        value={editData.position || ''}
                        onChange={(e) => setEditData({...editData, position: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Analis Keamanan Siber"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit/Bagian *</label>
                      <input
                        type="text"
                        required
                        value={editData.unit || ''}
                        onChange={(e) => setEditData({...editData, unit: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Direktorat Keamanan Siber"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Mulai *</label>
                      <input
                        type="date"
                        required
                        value={editData.startDate || ''}
                        onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={editData.endDate || ''}
                        onChange={(e) => setEditData({...editData, endDate: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      />
                      <p className="text-xs text-gray-800 mt-1">Kosongkan jika masih aktif</p>
                    </div>
                  </div>
                </>
              )}

              {/* Education Form */}
              {editType === 'EDUCATION' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Jenjang *</label>
                      <select
                        required
                        value={editData.degree || ''}
                        onChange={(e) => setEditData({...editData, degree: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Pilih Jenjang</option>
                        <option value="S3">S3 (Doktor)</option>
                        <option value="S2">S2 (Magister)</option>
                        <option value="S1">S1 (Sarjana)</option>
                        <option value="D4">D4</option>
                        <option value="D3">D3</option>
                        <option value="SMA/SMK">SMA/SMK</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Institusi *</label>
                      <input
                        type="text"
                        required
                        value={editData.institution || ''}
                        onChange={(e) => setEditData({...editData, institution: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Universitas Indonesia"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Jurusan/Program Studi</label>
                      <input
                        type="text"
                        value={editData.major || ''}
                        onChange={(e) => setEditData({...editData, major: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., Teknik Informatika"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">IPK/Nilai</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4"
                        value={editData.gpa || ''}
                        onChange={(e) => setEditData({...editData, gpa: e.target.value})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., 3.75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tahun Mulai *</label>
                      <input
                        type="number"
                        required
                        min="1950"
                        max={new Date().getFullYear()}
                        value={editData.startYear || ''}
                        onChange={(e) => setEditData({...editData, startYear: parseInt(e.target.value)})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., 2015"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tahun Lulus</label>
                      <input
                        type="number"
                        min="1950"
                        max={new Date().getFullYear() + 10}
                        value={editData.endYear || ''}
                        onChange={(e) => setEditData({...editData, endYear: parseInt(e.target.value)})}
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., 2019"
                      />
                      <p className="text-xs text-gray-800 mt-1">Kosongkan jika masih berlangsung</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditData({});
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      {employee && (
        <Chatbot employeeName={employee.fullName} />
      )}
    </div>
  );
}
