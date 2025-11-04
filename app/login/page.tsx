'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email atau password salah');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-10 rounded-3xl shadow-modern-lg w-full max-w-md border-2 border-white/50 hover-lift fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg pulse-animation">
            <span className="text-5xl">🔐</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-3">
            Talent Management
          </h1>
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-full border border-blue-300/30">
            <p className="text-gray-900 font-bold text-sm">🏛️ Badan Siber dan Sandi Negara</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="glass-card bg-red-50/80 border-2 border-red-400/50 text-red-800 px-5 py-4 rounded-xl font-semibold shadow-lg animate-shake">
              <div className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="text-lg">📧</span> Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 glass-card border-2 border-blue-200/50 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 text-gray-900 font-semibold placeholder-gray-500 shadow-modern transition-all"
              placeholder="nama@bssn.go.id"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="text-lg">🔑</span> Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 glass-card border-2 border-blue-200/50 rounded-xl focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 text-gray-900 font-semibold placeholder-gray-500 shadow-modern transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="modern-button w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-modern-lg hover:shadow-2xl hover:-translate-y-1"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚀</span>
                  <span>Login</span>
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-8 glass-card bg-gradient-to-r from-yellow-50/50 to-blue-50/50 p-5 rounded-xl border-2 border-yellow-300/30 shadow-modern">
          <p className="font-bold mb-3 text-blue-900 text-center flex items-center justify-center gap-2">
            <span className="text-xl">💡</span>
            <span>Demo Login</span>
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
              <span className="font-semibold text-gray-700">👨‍💼 OSDM:</span>
              <code className="text-blue-700 font-mono text-xs">osdm@bssn.go.id</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
              <span className="font-semibold text-gray-700">👤 Pegawai:</span>
              <code className="text-blue-700 font-mono text-xs">budi.santoso@bssn.go.id</code>
            </div>
            <div className="text-center mt-2 p-2 bg-yellow-100/50 rounded-lg">
              <span className="text-gray-700 font-semibold">🔑 Password: </span>
              <code className="text-blue-700 font-mono font-bold">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
